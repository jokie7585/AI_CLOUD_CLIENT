import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms' ;
import {MatRadioModule} from '@angular/material/radio' ;
import { NewRoutingModule } from './new-routing.module';
import { NewComponent } from './new.component';
import { from } from 'rxjs';


@NgModule({
  declarations: [],
  imports: [

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    NewRoutingModule

  ]
})
export class NewModule { }
