import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {agantCtr} from 'src/myservice/agentCtr.service'


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers:[agantCtr]
})
export class AgentModule { }