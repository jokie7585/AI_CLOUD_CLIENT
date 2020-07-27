import { Component, OnInit, Input } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { CookieService} from 'ngx-cookie-service' ;
import {environment} from 'src/environments/environment' ;
import { cookieList} from 'src/utility/cookie' ;
import { from } from 'rxjs';



@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {
  private cookieValue: string ;
  Inputnewrepository: string ;
  userId: string = null;
  constructor(private cookieService: CookieService,
              private http: HttpClient) { }

  newrepository(){
    console.log('create ws')
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/createWorkspace` ;
    let body = {
      WSName: this.Inputnewrepository
    }
    let options = {
      headers: {
        'Content-Type' : 'application/json'},
        withCredentials: true,
        'Cookie': 'token',
    };


    this.http.post<any>(url,body, options)
    .subscribe((res => {
      window.location.assign('workspace')
    }),
    err => {
      window.location.assign('login')
    });
  }


public ngOnInit(): void {
  this.userId = this.cookieService.get(cookieList.userID);
  }

}
