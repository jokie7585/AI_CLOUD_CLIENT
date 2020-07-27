import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service' ;


import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { from } from 'rxjs';
import { NewComponent } from './new/new.component';
import { FilesystemComponent } from './agent/filesystem/filesystem.component';
import {MatRadioModule} from '@angular/material/radio' ;

import {MatCheckboxModule} from '@angular/material/checkbox' ;
import { FormsModule } from '@angular/forms';
import { AgentComponent } from './agent/agent.component';



@NgModule({
  declarations: [WorkspaceComponent, NewComponent, FilesystemComponent, AgentComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
    WorkspaceRoutingModule
  ],
  providers: [CookieService]
})
export class WorkspaceModule { }
