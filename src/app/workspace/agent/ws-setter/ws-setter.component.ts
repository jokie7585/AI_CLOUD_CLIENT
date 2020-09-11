import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import {agantCtr} from 'src/myservice/agentCtr.service'
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

  TsVersion: HTMLInputElement;
  GpuNum: HTMLInputElement;

  // subcription
  allSub: Array<Subscription> = [];

  ngOnInit(): void {
    this.ComfirmBoard_ComfirmMessageTeplete = this.agent.userId.concat('/', this.agent.curWs);
    // config init
    this.TsVersion = document.getElementById('tsV-i') as HTMLInputElement;
    this.GpuNum = document.getElementById('gpu-i') as HTMLInputElement;
    // subscrube
    this.allSub.push(
      this.agent.cytusAppconfig$.subscribe(config => {
        this.TsVersion.value = config.tensorflowVersion;
        this.GpuNum.value = config.GpuNum.toString();
      })
    )
    
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
    this.agent.setConfig({
      tensorflowVersion: target.value,
      GpuNum:  Number.parseInt(this.GpuNum.value, 10)
    });
  }
  bind_GpuNum(event): void{
    let target: HTMLSelectElement = event.target;
    this.agent.setConfig({
      tensorflowVersion: this.TsVersion.value,
      GpuNum: Number.parseInt(target.value,10)
    });
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
