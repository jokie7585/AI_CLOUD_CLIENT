import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NewRoutingModule } from './new-routing.module';
import { NewComponent } from './new.component';


@NgModule({
  declarations: [],
  imports: [

    CommonModule,
    FormsModule,
    NewRoutingModule

  ]
})
export class NewModule { }
