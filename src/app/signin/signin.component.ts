import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {environment} from 'src/environments/environment' ;
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  InputAccount:string = '' ;
  Inputpassword:string = '' ;
  EnterPlace: boolean = true ;
  SuccessPlace: boolean = false ;
  ErrorPlace: boolean = false ;
  ServerMessage: string = null;


  constructor(private http: HttpClient, 
              private cookieService: CookieService,
              private route: Router) { }


  signUp(){
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
          let route = this.route;
          setTimeout( function() {
            route.navigateByUrl('login')
          }, 3000) ;

        },
        (err) => {
          console.log(err);
          this.ErrorPlace = true
          let {message} = err.error
          this.ServerMessage =  message;
        }
      );



  } // getAlert()

  jumpToLogin(){
    window.location.assign("login");
  }

  ngOnInit(): void {
  }

}
