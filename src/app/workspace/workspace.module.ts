import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service' ;


import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { from } from 'rxjs';
import { NewComponent } from './new/new.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [WorkspaceComponent, NewComponent],
  imports: [
    CommonModule,
    FormsModule,
    WorkspaceRoutingModule
  ],
  providers:[CookieService]
})
export class WorkspaceModule { }
