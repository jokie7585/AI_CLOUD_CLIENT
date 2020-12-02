import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {CommandTemplete, Branch, batchConfig, Command, agantCtr, option, optionTemplete, task} from 'src/myservice/agentCtr.service'
import {socketService} from 'src/myservice/socket.service'
import { BehaviorSubject, Subscription } from 'rxjs';
import {CytusAppStatus, CytusBatchConst, CytusBatchStatus} from 'src/utility/CetusProtocol'
import {pythonCodeEditorCompilerService} from 'src/myservice/pythonCodeEditorCompiler'

interface runningTimeCounter {
  curRuntime: number,
  startTime: number,
  isFinish:boolean
}

@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.css']
})
export class BatchComponent implements OnInit, OnDestroy {

  showBatchList: boolean = false;
  showSettings: boolean = true;
  showCreator: boolean = false;
  showBranchCreator: boolean = false;
  showCodeGenerator: boolean = false;
  CodeGeneratorlastGenerateIndex: number = -1;
  canRunBatch: boolean = false;

  //
  batchConf : Array<CommandTemplete>;
  CommandEditingMonitor$: Array<boolean>;
  BranchEditingMonitor$: Array<boolean>;
  branchset: Array<Branch>;
  branchRunTimeCounter:Array<runningTimeCounter>;

  // input element ref
  commandInput: HTMLInputElement;
  flagStringInput: HTMLInputElement;

  // constant
  C_hours_ms:number =  1000 * 60 * 60;
  C_mins_ms:number =  1000 * 60;
  C_secs_ms:number =  1000;

  // rex
  findFlagOption = /-[_a-zA-z][_a-zA-z0-9]*/;
  findPostionalOption = /[_a-zA-z][_a-z0-9A-z]*/;
  findOptionalOption = /--[_a-zA-z][_a-z0-9A-z]*/;

  // BranchcreatingForm
  creatingTemper: Branch;

  allSub: Array<Subscription> = [];
  branchRunTimeCounterTimer: NodeJS.Timeout
  constructor(private agantCtr: agantCtr,
              private pyContentCompiler:pythonCodeEditorCompilerService
    ) { }

  ngOnInit(): void {
    this.agantCtr.seletFuction('Batch')
    // subscribe branch
    this.allSub.push(this.agantCtr.batchConf.subscribe(val => {
      if(val) {
        console.log({curbatchConf:val})
      // initail and assign
      this.CommandEditingMonitor$ = [];
      this.BranchEditingMonitor$ = [];
      clearInterval(this.branchRunTimeCounterTimer);
      this.branchRunTimeCounter = [];
      this.canRunBatch = true;
      // deep copy
      let newObj = JSON.parse(JSON.stringify(val)) as batchConfig
      console.log({newObj:newObj})
      // init CommandEditingMonitor array
      this.batchConf = newObj.commandTemplete;
      this.branchset = newObj.branchSet;
      for(let i = 0; i < this.batchConf.length; i++) {
        this.CommandEditingMonitor$.push(false);
      }
      for(let i = 0; i < this.BranchEditingMonitor$.length; i++) {
        this.BranchEditingMonitor$.push(false);
      }
      for(let i = 0; i < this.branchset.length; i++) {
        let startDate:Date
        let endDate: Date
        if(this.branchset[i].timeStart) {
          startDate = new Date(this.branchset[i].timeStart)
        }
        if(this.branchset[i].timeEnd) {
          endDate = new Date(this.branchset[i].timeEnd)
        }
        // 註冊計時器
        if(this.branchset[i].status == CytusAppStatus.RUNNING) {
          this.branchRunTimeCounter.push({
            
            curRuntime: Date.now() - startDate.getTime(),
            startTime: Number.parseInt(startDate.toISOString()),
            isFinish: false
          })
        }
        else if(this.branchset[i].status == CytusAppStatus.COMPLETE) {
          this.branchRunTimeCounter.push({
            curRuntime: endDate.getTime()-startDate.getTime(),
            startTime: startDate.getTime(),
            isFinish: true
          })
        }
        else {
          this.branchRunTimeCounter.push({
            curRuntime: undefined,
            startTime: undefined,
            isFinish: true
          })
        }
        console.log({branchTimer: this.branchRunTimeCounter})
      }
      for(let i = 0; i < this.branchset.length; i++) {
        if(this.branchset[i].status == CytusAppStatus.RUNNING) {
          this.canRunBatch = false;
        }
      }
      if(this.branchset.length == 0) this.canRunBatch = false;
      // 註冊runningtimeCounter timer
      this.branchRunTimeCounterTimer = setInterval(() => {
        this.branchRunTimeCounter.forEach(el => {
          if(!el.isFinish) {
            el.curRuntime += 1000;
          }
        })
      }, 1000)
      }

    }))

  }

  ngOnDestroy(){
    for(let el of this.allSub ) {
      el.unsubscribe();
    }
  }

  isSelectt(isSelect){
    if(isSelect) {
      return '#ffa20d'
    }

    return '#292929'
  }

  isshowCreator(isShow: boolean , event ?: Event){
    event.stopPropagation();
    this.showCreator = isShow;
    if(isShow) {
      setTimeout(()=> {
        this.commandInput = document.getElementById('Commandcreator-input-command') as HTMLInputElement
        this.flagStringInput = document.getElementById('Commandcreator-input-flag') as HTMLInputElement
      }, 2)
    }
    else {
      this.agantCtr.ShowTaskList.next(false)
    }
  }

  isshowBranchCreator(isShow: boolean , event ?: Event) {
    event.stopPropagation();
    if(this.showBranchCreator && isShow) return;
    this.showBranchCreator = isShow;
    if(isShow) {
      this.startCreateNewBranch()
    }
  }

  creatorStyleSelector(isShow: boolean){
    if(event){
      event.stopPropagation()
    }
    if(isShow) {
      return 'CM-L-I-creator--after'
    }

    return 'CM-L-I-creator'
  }

  addNewBatchCommand(targetCmd?: CommandTemplete) {
    // console.log({
    //   command: this.commandInput.value,
    //   flagString: this.flagStringInput.value
    // })
    // split
    let paramMap = this.flagStringInput.value.split(';').map(el => {
      let processedEl = el.trim();
      return processedEl
    })
    // filter white space
    paramMap = paramMap.filter(el => {
      return el != ''
    })

    let optionMap = this.generateoptionTemplete(paramMap);
    let newCommdTemplete = Object.assign(this.batchConf);
    // update batchConf
    if(targetCmd) {
      // editing mod
    }
    else{
      // append mod
      newCommdTemplete = newCommdTemplete.concat([{
        command: this.commandInput.value,
        optionMap: optionMap
      }])
    }

    this.agantCtr.updateBatch_CommandTemplete(newCommdTemplete);
    // init
    this.commandInput.value = ''
    this.flagStringInput.value = ''
    this.showCreator = false;
  }

  deleteBatchCmdTemplete(el: CommandTemplete) {
    let index = this.batchConf.indexOf(el);
    let newCommdTemplete = Object.assign(this.batchConf) as Array<CommandTemplete>;
    newCommdTemplete = newCommdTemplete.slice(0, index).concat(newCommdTemplete.slice(index+1))
    this.agantCtr.updateBatch_CommandTemplete(newCommdTemplete);
  }

  pageSwitch(target: 'setting' | 'list') {
    if(target == 'setting') {
      this.showBatchList = false;
      this.showSettings = true;

    }
    else if( target == 'list') {
      this.showBatchList = true;
      this.showSettings = false;
    }
  }

  startCreateNewBranch() {
    this.creatingTemper = {
      logPath: 'none',
      name: '',
      root: 'undefined',
      yamalPath: 'undefined',
      status: CytusAppStatus.WAIT,
      podname: 'undefined',
      CommandList: this.batchConf.map(el => {
        return{
          command: el.command,
          optionMap: el.optionMap.map(ele => {
            return {
              name: ele.name,
              type: ele.type,
              value: ''
            } as option
          })
        }
      }),
      timeStart: undefined,
      timeEnd: undefined
    }
    console.log({inittailizedBranchcreatingTemper: this.creatingTemper})
    setTimeout(()=> {
      let nameInput = document.getElementById('branchCreator-input-name') as HTMLInputElement;
      nameInput.focus()
      nameInput.value = 'branch' + this.branchset.length;
      nameInput.select()
    })
  }

  processBranchCreateFlagset(targetRef: option, event: Event) {
    let targetinput = event.target as HTMLInputElement
    targetRef.value = targetinput.value;

    console.log({updat: targetRef.name, value: targetRef.value})
  }

  deleteBranch(el: Branch) {
    this.agantCtr.DeleteBranch(this.branchset.indexOf(el));
  }

  comfirmBranchEditing(index){
    this.agantCtr.updateBranchSet(this.branchset);
  }

  pushBranchToServer(){
    // branch name input
    let nameInput = document.getElementById('branchCreator-input-name') as HTMLInputElement;
    // create new branch config from `creatingTemper`
    let config = this.creatingTemper;
    // set config.name
    config.name = nameInput.value;
    // push to server
    this.agantCtr.appendNewBranch(config);
    this.showBranchCreator = false
  }

  openBashCommandImportor(){
    if(this.agantCtr.ShowTaskList.getValue() == true) {
      // 如果是taskList已經打開，則關閉並刪除BashCommandImportor註冊的Task。
      this.agantCtr.taskUnRegist('batchCommandImport');
      this.agantCtr.ShowTaskList.next(false);
    }
    else{
      if(this.showCreator) {
        this.agantCtr.getCommandList((commandList) => {
          let processedArray = commandList.filter(el => {
            el = el.trim();
            return el.length>0 && el[0]!='#';
          })
          this.agantCtr.taskRegist('batchCommandImport', 'Click to import...', this.createTaskElement(processedArray))
          this.agantCtr.fetchTaskList('batchCommandImport')
          this.agantCtr.ShowTaskList.next(true);
        });
      }
    }
  }

  createTaskElement(commandList: Array<string>): Array<task>{
    let taskList: Array<task> = commandList.map(el => {
      return {
        name: el,
        group:'batchCommandImport',
        hotKet: '',
        action: () => {
          this.commandInput.value = el;
          this.agantCtr.ShowTaskList.next(false)
        },
        isSuperTask: false,
        description: 'try it!'
      } as task;
    })

    taskList.push({
      name: 'Import All',
        group:'batchCommandImport',
        hotKet: '',
        action: () => {
          let allCommand = taskList.filter(el => {
            return el.isSuperTask != true
          })
          let newCommdTemplete = Object.assign(this.batchConf) as Array<CommandTemplete>
          for(let el of allCommand) {
            newCommdTemplete.push({
              command: el.name,
              optionMap: []
            } as CommandTemplete)
            this.showCreator = false;
          }
          this.agantCtr.ShowTaskList.next(false)
          this.agantCtr.updateBatch_CommandTemplete(newCommdTemplete);
        },
        isSuperTask: true,
        description: 'Append all command in Template!'
    } as task)
    return taskList;
  }

  togleCommandEditor(index: number) {
    this.CommandEditingMonitor$[index] = !this.CommandEditingMonitor$[index];
    if(this.CommandEditingMonitor$[index]) {
      console.log('open CommandEditor : ' + index)
      setTimeout(() => {
        let targetInput_Cmd = document.getElementById(`CM-L-I-Editor${index}command`) as HTMLInputElement;
        let targetInput_flag = document.getElementById(`CM-L-I-Editor${index}flag`) as HTMLInputElement;
        targetInput_Cmd.value = this.batchConf[index].command;
        targetInput_flag.value = this.composeParamTemplateMapToString(this.batchConf[index].optionMap);
        targetInput_flag.select();
      }, 5)
      
    }
    else{
      this.agantCtr.ShowTaskList.next(false)
      console.log('close CommandEditor : ' + index)
    }
  }

  togleBranchEditor(index: number) {
    this.BranchEditingMonitor$[index] = !this.BranchEditingMonitor$[index];
    if(!this.BranchEditingMonitor$[index]) {
      // 關閉editor時 要還原數據
      console.log('sucess reset editing component')
      console.log({serviceValue: this.agantCtr.batchConf.getValue()})
      this.branchset[index] = this.agantCtr.batchConf.getValue().branchSet[index];
    }
  }

  composeInputID(index: number, type: 'command' | 'flag'){
    return `CM-L-I-Editor${index}${type}`
  }

  composeInputRadioname(index: number) {
    return `BranchFlagSetRadio${index}`
  }
  
  processBranchFlagSet_radio_click(ref: option, CytusTrue: boolean){
    console.log('radioChange to: ' + CytusTrue)
    if(CytusTrue) {
      ref.value = CytusBatchConst.CytusTrue
    }
    else {
      ref.value = CytusBatchConst.CytusFalse
    }
  }

  processBranchFlagSet_radio_Check(ref: option, defalut?:boolean){
    if((ref.value == CytusBatchConst.CytusTrue) == defalut) {
      return true
    }
    else{
      return false
    }
  }

  completeEditing(index: number) {
    // push result to server
    let targetInput_Cmd = document.getElementById(`CM-L-I-Editor${index}command`) as HTMLInputElement;
    let targetInput_flag = document.getElementById(`CM-L-I-Editor${index}flag`) as HTMLInputElement;
    if(targetInput_Cmd) {
      let parameterArray = targetInput_flag.value.split(';').map(el => {
        let processedEl = el.trim();
        return processedEl
      })
      // filter white space
      parameterArray = parameterArray.filter(el => {
        return el != ''
      })
      console.log({parameterArray:parameterArray})
      let optionMap = this.generateoptionTemplete(parameterArray)
      console.log(optionMap)
      this.batchConf[index].command = targetInput_Cmd.value;
      this.batchConf[index].optionMap = optionMap;
      console.log({finishedEditing:this.batchConf[index]})
      this.togleCommandEditor(index);
      // push to server by agantCtr
      this.agantCtr.updateBatch_CommandTemplete(this.batchConf)
    }
  }

  generateoptionTemplete(parameterArray: Array<string>): Array<optionTemplete>{
    let optionTemplete:  Array<optionTemplete> = []
    for(let param of parameterArray) {
      if(param.match(this.findFlagOption) && param.match(this.findFlagOption)[0].length == param.length) {
        // flag param find
        optionTemplete.push({name:param, type:'flag'})
      }
      else if(param.match(this.findOptionalOption) && param.match(this.findOptionalOption)[0].length == param.length) {
        // Optional param find
        optionTemplete.push({name:param, type:'option'})
      }
      else if(param.match(this.findPostionalOption) && param.match(this.findPostionalOption)[0].length == param.length) {
        // Postional param find
         optionTemplete.push({name:param, type:'position'})
      }
    }

    return optionTemplete;
  }

  composeParamTemplateMapToString(map: Array<optionTemplete>):string {
    let composeString = ''
    for(let param of map) {
      composeString = composeString.concat(param.name, ';')
    }
    return composeString
  }


  resetBatch() {
    this.agantCtr.updateBatch_CommandTemplete([])
  }

  runBatch() {
    if(this.agantCtr.checkSettingOk()) {
      this.canRunBatch = false;
      this.branchset.forEach(el => {
      el.status = 'submiting'
      })
      this.branchRunTimeCounter.forEach
      this.agantCtr.runwbatch();
    }
  }

  maskBranchRuntimeCounter() {
    clearInterval(this.branchRunTimeCounterTimer)
    setTimeout(() => {
      this.branchRunTimeCounter.forEach(el => {
        el.isFinish = true;
        el.curRuntime = undefined;
      })
    },1000)
  
  }

  reloadBatchConfig(){
    this.agantCtr.getBatchConf();
  }

  muteAll(){
    this.BranchEditingMonitor$.forEach(el => {
      el = false;
    })
    this.CommandEditingMonitor$.forEach(el => {
      el = false;
    })
    this.showBranchCreator = false;
    this.showCreator = false;
  }

  runningTimeStringGen(source: runningTimeCounter) {
    if(source.curRuntime) {
      let hour = source.curRuntime / this.C_hours_ms;
      let min = source.curRuntime % this.C_hours_ms  / this.C_mins_ms;
      let sec = source.curRuntime % this.C_hours_ms  % this.C_mins_ms / this.C_secs_ms;
      return `${Math.floor(hour)}:${Math.floor(min)}:${Math.floor(sec)}`
      // return source.curRuntime
    }
    else {
      return 'N/A'
    }
    
  }

  // 
  generatePythonCode(optionTemplete: Array<optionTemplete>, indexOfTemplate:number) {
    if(!this.showCodeGenerator || this.CodeGeneratorlastGenerateIndex != indexOfTemplate) {
      this.showCodeGenerator = true;
      this.CodeGeneratorlastGenerateIndex =  indexOfTemplate;
      setTimeout(() => {
        let targetEl = document.getElementById('codeGenerator-code') as HTMLDivElement
       targetEl.innerHTML = '' // 先清空
        // 產生code
        let CompiledPyCode = this.pyContentCompiler.parseFromCommandTemplete(optionTemplete);
        targetEl.innerHTML = CompiledPyCode
      },500)
    }
    else {
      this.showCodeGenerator = false;
    }
  }

  closeCodeGenerator() {
    this.showCodeGenerator = false;
  }

  copycontent(id: string) {
    let targetEl = document.getElementById(id) as HTMLDivElement
    console.log(targetEl.innerHTML)
  }

}

