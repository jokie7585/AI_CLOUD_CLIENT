import { Component, OnInit, OnDestroy } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import {Router} from '@angular/router'
import {cookieList} from 'src/utility/cookie'
import {environment} from 'src/environments/environment';
import {AppbarControllerService} from 'src/myservice/appbar-controller.service'
import * as path from 'src/app/app-path.const'
import { from } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  appPath = path;
  InputAccount: string = '' ;
  Inputpassword: string = '' ;
  ServerMessage: string = null;
  showSuccessMsg:boolean = false;
  showFailMsg:boolean = false;

  constructor(private http: HttpClient, 
              private cookie: CookieService,
              private router: Router,
              private appCtr: AppbarControllerService ) {}


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
          this.showFailMsg = false;
          this.showSuccessMsg = true;
          console.log(res);
          this.ServerMessage =  res.message ;
          this.cookie.set(cookieList.userID, this.InputAccount);
          window.location.assign('workspace');
        },
        (err) => {
          this.showFailMsg = true;
          console.log(err);
          this.ServerMessage =  err.error.message ;
          el.disabled = false;
        }
      );

    }

  
  jumpSignUp(){
    this.router.navigate([path.appPath.signin])
  }


  ngOnInit(): void {
    this.appCtr.Closefooter();
    window.scroll({top: 0} )
  }

  ngOnDestroy(){
    this.appCtr.Showfooter()
  }

}
