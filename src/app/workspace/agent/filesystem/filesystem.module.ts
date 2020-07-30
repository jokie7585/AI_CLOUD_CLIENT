import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser'

import { FilesystemRoutingModule } from './filesystem-routing.module';
import { from } from 'rxjs';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FilesystemRoutingModule,
    BrowserModule
  ]
})
export class FilesystemModule { }