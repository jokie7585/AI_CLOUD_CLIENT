import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import {agantCtr, workspaceconfig} from 'src/myservice/agentCtr.service'
import { config, Subscription } from 'rxjs';

@Component({
  selector: 'app-ws-setter',
  templateUrl: './ws-setter.component.html',
  styleUrls: ['./ws-setter.component.css']
})
export class WsSetterComponent implements OnInit, OnDestroy,AfterViewChecked {
  // ComfirmBoard
  isShowComfirmBoard: boolean = false;
  ComfirmBoard_ComfirmMessageTeplete: string = '';
  isComfirmed: boolean= false;
  isShowDeleteWorkspaceBoard:boolean= false;
  comfirmBoardInput: HTMLInputElement = null;
  comfirmBoardAction = null;

  constructor(private agent:agantCtr) { }

  // 
  TsVersion: HTMLInputElement;
  GpuNum: HTMLInputElement;
  MemoryCapacity: HTMLInputElement;
  CpuRequest: HTMLInputElement;

  tempCytusAppConfig: workspaceconfig;

  // subcription
  allSub: Array<Subscription> = [];

  ngOnInit(): void {
    this.agent.seletFuction('setting')
    this.ComfirmBoard_ComfirmMessageTeplete = this.agent.userId.concat('/', this.agent.curWs);
    // config init
    this.TsVersion = document.getElementById('tsV-i') as HTMLInputElement;
    this.GpuNum = document.getElementById('gpu-i') as HTMLInputElement;
    this.MemoryCapacity = document.getElementById('mem-i') as HTMLInputElement;
    this.CpuRequest = document.getElementById('cpu-i') as HTMLInputElement;
    // subscrube
    this.allSub.push(
      this.agent.cytusAppconfig$.subscribe(config => {
        this.tempCytusAppConfig = config;
        // bind to target input element
        this.bindToTargetInputElement(config);
      })
    )
    
  }

  bindToTargetInputElement(config: workspaceconfig) {
    // image version option load
    if(config.tensorflowVersion) {
      this.TsVersion.value = config.tensorflowVersion;
    }
    else {
      this.TsVersion.value = 'Init';
    }

    // gpu option load
    if(config.tensorflowVersion) {
      this.GpuNum.value = config.GpuNum.toString(10);
    }
    else {
      this.GpuNum.value = 'Init';
    }

    // MemoryCapacity option load
    if(config.MemoryCapacity) {
      this.MemoryCapacity.value = config.MemoryCapacity
    }
    else {
      this.MemoryCapacity.value = 'Init';
    }

    // CpuRequest option load
    if(config.CpuRequest) {
      this.CpuRequest.value = config.CpuRequest.toString(10)
    }
    else {
      this.CpuRequest.value = 'Init';
    }

  }

  ngAfterViewChecked(){
    if(this.isShowComfirmBoard && this.comfirmBoardInput==null) {
      this.comfirmBoardInput = document.getElementById('comfirmBoard-input') as HTMLInputElement;
      this.comfirmBoardInput.addEventListener('input', (event) => {
        let e = event as InputEvent;
        if(this.comfirmBoardInput.value == this.ComfirmBoard_ComfirmMessageTeplete) {
          this.isComfirmed = true;
        }
        else{
          this.isComfirmed = false;
        }
      })
    }
  }

  ngOnDestroy(){
    this.allSub.forEach(el => {
      el.unsubscribe();
    })
  }

  stopProbgation(event: Event) {
    event.stopPropagation();
  }

  bind_TsVersion(event): void{
    let target: HTMLSelectElement = event.target;
    this.tempCytusAppConfig.tensorflowVersion = target.value;
    this.agent.setConfig(this.tempCytusAppConfig);
  }
  bind_GpuNum(event): void{
    let target: HTMLSelectElement = event.target;
    this.tempCytusAppConfig.GpuNum = Number.parseInt(target.value,10);
    this.agent.setConfig(this.tempCytusAppConfig);
  }

  bind_CpuNum(event): void{
    let target: HTMLSelectElement = event.target;
    this.tempCytusAppConfig.CpuRequest = Number.parseInt(target.value,10);
    this.agent.setConfig(this.tempCytusAppConfig);
  }

  bind_Memory(event) {
    let target: HTMLSelectElement = event.target;
    this.tempCytusAppConfig.MemoryCapacity = target.value;
    this.agent.setConfig(this.tempCytusAppConfig);
  }

  openDeleteWorkspaceComfirmBoard(){
    this.isShowDeleteWorkspaceBoard = true;
    this.comfirmBoardAction = ()=> {
      this.agent.deleteWs();
    }
    this.openComfirmBoard(); 
  }

  openComfirmBoard() {
    this.isShowComfirmBoard = true;
    this.isComfirmed=false;
  }

  closeComfirmBoard() {
    this.isShowComfirmBoard = false;
    this.isShowDeleteWorkspaceBoard = false;
    this.comfirmBoardAction = null;
  }
}
