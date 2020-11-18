import { Component, OnInit, OnDestroy } from '@angular/core';
import {CommandTemplete, Branch, batchConfig, Command, agantCtr, option, task} from 'src/myservice/agentCtr.service'
import {socketService} from 'src/myservice/socket.service'
import { BehaviorSubject, Subscription } from 'rxjs';
import {CytusAppStatus, CytusBatchStatus} from 'src/utility/CetusProtocol'

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

  // BranchcreatingForm
  creatingTemper: Branch;

  allSub: Array<Subscription> = [];
  branchRunTimeCounterTimer: NodeJS.Timeout
  constructor(private agantCtr: agantCtr
    ) { }

  ngOnInit(): void {
    // subscribe branch
    this.allSub.push(this.agantCtr.batchConf.subscribe(val => {
      console.log({curbatchConf:val})
      // initail and assign
      this.CommandEditingMonitor$ = [];
      this.BranchEditingMonitor$ = [];
      this.branchRunTimeCounter = [];
      this.canRunBatch = true;
      // deep copy
      let newObj = JSON.parse(JSON.stringify(val)) as batchConfig
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
        let startDate
        let endDate
        if(this.branchset[i].timeStart) {
          startDate = new Date(this.branchset[i].timeStart)
        }
        if(this.branchset[i].timeEnd) {
          endDate = new Date(this.branchset[i].timeStart)
        }
        if(this.branchset[i].status == CytusAppStatus.RUNNING) {
          this.branchRunTimeCounter.push({
            curRuntime: Date.now() - Number.parseInt(startDate.toISOString()),
            startTime: Number.parseInt(startDate.toISOString()),
            isFinish: false
          })
        }
        else if(this.branchset[i].status == CytusAppStatus.COMPLETE) {
          this.branchRunTimeCounter.push({
            curRuntime: Number.parseInt(endDate.toISOString())-Number.parseInt(startDate.toISOString()),
            startTime: Number.parseInt(this.branchset[i].timeStart.toISOString()),
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

  composeFlagstring(command: Command) {
    return command.optionMap.join(' ; ')
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
    let optionMap = this.flagStringInput.value.split(';').map(el => {
      let processedEl = el.trim();
      return processedEl
    })
    // filter white space
    optionMap = optionMap.filter(el => {
      return el != ''
    })
    console.log('call adaddNewBatchCommand')
    console.log(this.batchConf)
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
              name: ele,
              value: ''
            }
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
        targetInput_flag.value = this.batchConf[index].optionMap.join(' ; ');
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

  completeEditing(index: number) {
    // push result to server
    let targetInput_Cmd = document.getElementById(`CM-L-I-Editor${index}command`) as HTMLInputElement;
    let targetInput_flag = document.getElementById(`CM-L-I-Editor${index}flag`) as HTMLInputElement;
    if(targetInput_Cmd) {
      let optionMap = targetInput_flag.value.split(';').map(el => {
        let processedEl = el.trim();
        return processedEl
      })
      // filter white space
      optionMap = optionMap.filter(el => {
        return el != ''
      })
      console.log(optionMap)
      this.batchConf[index].command = targetInput_Cmd.value;
      this.batchConf[index].optionMap = optionMap;
      this.togleCommandEditor(index);
      // push to server by agantCtr
      this.agantCtr.updateBatch_CommandTemplete(this.batchConf)
    }
  }

  resetBatch() {
    this.agantCtr.updateBatch_CommandTemplete([])
  }

  runBatch() {
    this.agantCtr.runwbatch();
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

  testSocketPeek() {
  }

}
