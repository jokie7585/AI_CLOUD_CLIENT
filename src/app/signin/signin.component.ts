import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { RouterLink } from '@angular/router';
import {environment} from 'src/environments/environment' ;
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  InputAccount: '' ;
  Inputpassword: '' ;
  EnterPlace: boolean = true ;
  SuccessPlace: boolean = false ;
  ErrorPlace: boolean = false ;
  ServerMessage: string = null;


  constructor(private http: HttpClient) { }


  getAlert(){
    let body = {
        account: this.InputAccount,
        password: this.Inputpassword
    };

    let url = `http://${environment.apiserver}/api/auth/signUp` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
      withCredentials: true
    };

    this.http.post<any>(url, body, options)
      .subscribe( (res) => {
          console.log(res);
          this.ServerMessage =  res.message ;
          this.EnterPlace = false ;
          this.SuccessPlace = true ;
          alert( this.ServerMessage )  ;
          setTimeout( function() {
            window.location.assign("login");
          }, 3000) ;

        },
        (err) => {
          console.log(err);
          this.ServerMessage =  err.error.message ;
          this.ErrorPlace = true ;
          alert( this.ServerMessage )  ;
        }
      );



  } // getAlert()

  jumpToLogin(){
    window.location.assign("login");
  }

  ngOnInit(): void {
  }

}
