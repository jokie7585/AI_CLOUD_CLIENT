import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms' ;
import { NewRoutingModule } from './new-routing.module';
import { NewComponent } from './new.component';
import { from } from 'rxjs';


@NgModule({
  declarations: [],
  imports: [

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NewRoutingModule

  ]
})
export class NewModule { }
