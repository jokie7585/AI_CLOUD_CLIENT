import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import {cookieList} from 'src/utility/cookie'
import {environment} from 'src/environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  InputAccount: string = '' ;
  Inputpassword: string = '' ;
  ServerMessage: string = null;
  constructor(private http: HttpClient, private cookie: CookieService ) {}


  login(event){
    let body = {
      username: this.InputAccount,
      password: this.Inputpassword
    };

    let url = `http://${environment.apiserver}/api/auth/logIn` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
      withCredentials: true
    };

    // disable clickable
    let el: HTMLButtonElement = event.target;
    el.disabled = true;

    this.http.post<any>(url, body, options)
      .subscribe( (res) => {
          console.log(res);
          this.ServerMessage =  res.message ;
          this.cookie.set(cookieList.userID, this.InputAccount);
          window.location.assign('workspace');
        },
        (err) => {
          console.log(err);
          this.ServerMessage =  err.error.message ;
          el.disabled = false;
        }
      );

    }



  ngOnInit(): void {
    window.scroll({top:0})
  }

}
