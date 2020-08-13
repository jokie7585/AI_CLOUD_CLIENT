import { Component, OnInit } from '@angular/core';
import {agantCtr} from 'src/myservice/agentCtr.service'
import { config } from 'rxjs';

@Component({
  selector: 'app-ws-setter',
  templateUrl: './ws-setter.component.html',
  styleUrls: ['./ws-setter.component.css']
})
export class WsSetterComponent implements OnInit {
  isShowComfirmBoard: boolean = false;

  constructor(private agent:agantCtr) { }

  TsVersion: HTMLInputElement;
  GpuNum: HTMLInputElement;

  ngOnInit(): void {
    this.TsVersion = document.getElementById('tsV-i') as HTMLInputElement;
    this.GpuNum = document.getElementById('gpu-i') as HTMLInputElement;
    this.TsVersion.value = this.agent.cytusappconfig.tensorflowVersion;
    this.GpuNum.value = this.agent.cytusappconfig.GpuNum.toString();
    // subscrube
    this.agent.cytusAppconfig$.subscribe(config => {
      this.TsVersion.value = config.tensorflowVersion;
      this.GpuNum.value = config.GpuNum.toString();
    })
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

  openComfirmBoard() {
    console.log('click')
    this.isShowComfirmBoard = true;
  }

  closeComfirmBoard() {
    console.log('click')
    this.isShowComfirmBoard = false;
  }
}
