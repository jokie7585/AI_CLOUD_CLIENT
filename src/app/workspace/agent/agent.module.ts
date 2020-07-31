import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentRoutingModule } from './agent-routing.module';
import { WsSetterComponent } from './ws-setter/ws-setter.component';
import {agantCtr} from 'src/myservice/agentCtr.service'
import { TexteditorService } from 'src/myservice/texteditor.service';
import { TerminalService } from 'src/myservice/terminal.service';


@NgModule({
  declarations: [WsSetterComponent],
  imports: [
    CommonModule,
    AgentRoutingModule
  ],
  providers:[agantCtr,TexteditorService,TerminalService]
})
export class AgentModule { }