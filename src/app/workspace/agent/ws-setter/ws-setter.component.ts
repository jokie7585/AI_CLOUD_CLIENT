import { Component, OnInit } from '@angular/core';
import {agantCtr} from 'src/myservice/agentCtr.service'
import { config } from 'rxjs';

@Component({
  selector: 'app-ws-setter',
  templateUrl: './ws-setter.component.html',
  styleUrls: ['./ws-setter.component.css']
})
export class WsSetterComponent implements OnInit {

  constructor(private agent:agantCtr) { }

  TsVersion: string;
  GpuNum: number;

  ngOnInit(): void {
    this.agent.cytusAppconfig$.subscribe(config => {
      this.TsVersion = config.tensorflowVersion;
      this.GpuNum = config.GpuNum;
    })
  }

  bind_TsVersion(event): void{
    let target: HTMLSelectElement = event.target;
    this.agent.setConfig({
      tensorflowVersion: target.value,
      GpuNum: this.GpuNum
    });
  }
  bind_GpuNum(event): void{
    let target: HTMLSelectElement = event.target;
    this.agent.setConfig({
      tensorflowVersion: target.value,
      GpuNum: Number.parseInt(target.value,10)
    });
  }

}
