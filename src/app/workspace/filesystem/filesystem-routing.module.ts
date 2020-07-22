import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {FilesystemComponent} from './filesystem.component' ;
const routes: Routes = [
  {
    path: '',
    component: FilesystemComponent,
  },
  {
    path: ':path',
    component: FilesystemComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilesystemRoutingModule { }