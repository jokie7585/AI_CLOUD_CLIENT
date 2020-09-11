import { Component, OnInit, OnDestroy } from '@angular/core';
import {CommandTemplete, Branch, batchConfig, Command, agantCtr, option} from 'src/myservice/agentCtr.service'
import { BehaviorSubject, Subscription } from 'rxjs';


@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.css']
})
export class BatchComponent implements OnInit, OnDestroy {

  showBatchList: boolean = false;
  showSettings: boolean = true;
  showCreator: boolean = false;
  showBreanchCreator: boolean = false;
  batchConf : Array<CommandTemplete>;
  branchset: Array<Branch>;

  // input
  commandInput: HTMLInputElement;
  flagStringInput: HTMLInputElement;

  // BranchcreatingForm
  creatingTemper: Branch;

  allSub: Array<Subscription> = [];
  constructor(private agantCtr: agantCtr) { }

  ngOnInit(): void {
    this.allSub.push(this.agantCtr.batchConf.subscribe(val => {
      this.batchConf = val.commandTemplete;
      this.branchset = val.branchSet;
      console.log({insubBatchConf: val.name})
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
    let result = '' + command.optionMap[0];
    for(let i = 1; i < command.optionMap.length; i++) {
      result += command.optionMap[i] + ' ; '
    }

    return result
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
  }

  isshowBranchCreator(isShow: boolean , event ?: Event) {
    event.stopPropagation();
    if(this.showBreanchCreator && isShow) return;
    this.showBreanchCreator = isShow;
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
    let optionMap = this.flagStringInput.value.split(';').map(el => {
      el.trim();
      return el
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
      root: '',
      yamalPath: '',
      status: 'undefined',
      podname: 'none',
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
      })
    }
    console.log({inittailizedBranchcreatingTemper: this.creatingTemper})
    setTimeout(()=> {
      let nameInput = document.getElementById('branchCreator-input-name') as HTMLInputElement;
      nameInput.focus()
      nameInput.value = 'branch' + this.branchset.length;
      nameInput.select()
    })
  }

  processBranchCreate(targetRef: option, event: Event) {
    let targetinput = event.target as HTMLInputElement
    targetRef.value = targetinput.value;

    console.log({updat: targetRef.name, value: targetRef.value})
  }

  deleteBranch(el: Branch) {
    this.agantCtr.DeleteBranch(el);
  }

  pushBranchToServer(){
    let nameInput = document.getElementById('branchCreator-input-name') as HTMLInputElement;
    let config = this.creatingTemper;
    config.name = nameInput.value;
    this.agantCtr.appendNewBranch(config);
    this.showBreanchCreator = false
  }

  runBatch() {
    this.agantCtr.runwbatch();
  }

}
