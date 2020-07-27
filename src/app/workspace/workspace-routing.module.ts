import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceComponent } from './workspace.component';
import {WSPath} from './workspace-path.const' ;


import { from } from 'rxjs';

const routes: Routes = [
  {
    path: WSPath.workspace,
    component: WorkspaceComponent
  },
  {
    path: WSPath.new,
    loadChildren: () => import('./new/new.module').then(m => m.NewModule)
  },
  {
    // agent is a component to controll a workspace(a cetus app)
    path: 'manage/marketplace',
    loadChildren: () => import('./marketplace/marketplace.module').then( m => m.MarketplaceModule)
  },
  {
    // agent is a component to controll a workspace(a cetus app)
    path: WSPath.agent,
    loadChildren: () => import('./agent/agent.module').then( m => m.AgentModule)
  },

  {
    path: '**',
    redirectTo: WSPath.workspace,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
