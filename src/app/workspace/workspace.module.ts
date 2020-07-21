import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service' ;


import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { from } from 'rxjs';
import { NewComponent } from './new/new.component';
import { FilesystemComponent } from './filesystem/filesystem.component';




@NgModule({
  declarations: [WorkspaceComponent, NewComponent, FilesystemComponent],
  imports: [
    CommonModule,
    WorkspaceRoutingModule
  ],
  providers:[CookieService]
})
export class WorkspaceModule { }
