import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service' ;


import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { from } from 'rxjs';
import { NewComponent } from './new/new.component';
import { OverviewComponent } from './overview/overview.component';
import { FilesystemComponent } from './agent/filesystem/filesystem.component';
import {WsSetterComponent} from './agent/ws-setter/ws-setter.component'
import {MatRadioModule} from '@angular/material/radio' ;

import {MatCheckboxModule} from '@angular/material/checkbox' ;
import { FormsModule } from '@angular/forms';
import { AgentComponent } from './agent/agent.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import {agantCtr} from 'src/myservice/agentCtr.service'
import {socketService} from 'src/myservice/socket.service';
import {BatchComponent} from './agent/batch/batch.component'
import { CircleProgressComponent } from 'src/app/util/circle-progress/circle-progress.component'




@NgModule({
  declarations: [ OverviewComponent, BatchComponent, WorkspaceComponent, NewComponent, FilesystemComponent, AgentComponent, MarketplaceComponent,CircleProgressComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
    WorkspaceRoutingModule
  ],
  providers: [CookieService,agantCtr,socketService],
})
export class WorkspaceModule { }
