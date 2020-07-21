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
    path: WSPath.filesystem,
    loadChildren: () => import('./filesystem/filesystem.module').then( m => m.FilesystemModule)
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
