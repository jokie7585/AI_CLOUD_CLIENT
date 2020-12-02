import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DocumentComponent} from './document.component'
import {DocumentRoutingModule} from './dockument.routing.module'


@NgModule({
  declarations: [DocumentComponent],
  imports: [
    CommonModule,
    DocumentRoutingModule
  ]
})
export class DocumentModule { }
