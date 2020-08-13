import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser'
import {agantCtr} from 'src/myservice/agentCtr.service'

import {WsSetterComponent} from './ws-setter.component'


@NgModule({
  declarations: [WsSetterComponent],
  imports: [
    CommonModule,
    BrowserModule
  ],
  providers:[agantCtr]
})
export class WsSetterModule { }