import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SigninRoutingModule } from './signin-routing.module';
import { SigninComponent } from './signin.component';


@NgModule({
  declarations: [SigninComponent],
  imports: [
    CommonModule,
    FormsModule,
    SigninRoutingModule
  ]
})
export class SigninModule { }
