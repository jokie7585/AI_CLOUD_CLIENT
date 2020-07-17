import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  InputAccount: string = '' ;
  Inputpassword: string = '' ;
  ServerMessage: string = null;
  constructor(private http: HttpClient ) {}


  login(){
    let body = {
      username: this.InputAccount,
      password: this.Inputpassword
    };

    let url = 'http://192.168.43.219:3001/api/auth/logIn' ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
      withCredentials: true
    };

    this.http.post<any>(url, body, options)
      .subscribe( (res) => {
          console.log(res);
          this.ServerMessage =  res.message ;
          alert( this.ServerMessage )  ;
          window.location.assign('workspace');
        },
        (err) => {
          console.log(err);
          this.ServerMessage =  err.error.message ;
          alert( this.ServerMessage )  ;
        }
      );

    }



  ngOnInit(): void {
    // this.getAlert();
  }

}
