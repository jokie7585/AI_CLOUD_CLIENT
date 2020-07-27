import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AgentComponent} from './agent.component' ;
import {FilesystemComponent} from './filesystem/filesystem.component'
import {WsSetterComponent} from './ws-setter/ws-setter.component'
const routes: Routes = [
  {
    path: '',
    component: AgentComponent,
    children:[
      {
        path: '',
        redirectTo: 'filesystem',
        component: FilesystemComponent,
      },
      {
        path: 'filesystem',
        component: FilesystemComponent,
      },
      {
        path: 'history'
      },
      {
        path: 'setting',
        component: WsSetterComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule { }