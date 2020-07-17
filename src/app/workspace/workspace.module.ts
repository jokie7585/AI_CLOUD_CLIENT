import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { from } from 'rxjs';


@NgModule({
  declarations: [WorkspaceComponent],
  imports: [
    CommonModule,
    WorkspaceRoutingModule
  ]
})
export class WorkspaceModule { }
