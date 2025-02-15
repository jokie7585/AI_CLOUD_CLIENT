import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Template } from '@angular/compiler/src/render3/r3_ast';
import {WSPath} from './workspace-path.const' ;
import {appPath} from 'src/app/app-path.const'
import { CookieService } from 'ngx-cookie-service' ;
import {HttpClient} from '@angular/common/http';
import { NumberSymbol } from '@angular/common';
import { cookieList} from 'src/utility/cookie' ;
import {environment} from 'src/environments/environment' ;
import {AppbarControllerService} from 'src/myservice/appbar-controller.service';
import {AppUtilService} from 'src/myservice/appUtility.service';
import {socketService} from 'src/myservice/socket.service';
import { assert } from 'console';

interface data {
  name: string
  type: string
}

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],
  providers: [AppbarControllerService]
})
export class WorkspaceComponent implements OnInit {

  workspaceList: Array<data> = [];

  userId: string = '';

  constructor(private cookieService: CookieService,
              private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute,
              private socket: socketService,
              private appUtil: AppUtilService
              ) { }




  public ngOnInit(): void {
    this.socket.init()
    this.appUtil.init();
    this.userId = this.cookieService.get(cookieList.userID)
    this.getWSLIST();
    // force go to app home(prevent)
    this.router.navigate([appPath.workspace])
  }

  getWSLIST(){

    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/loadWorkspaceList` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
        withCredentials: true,
        'Cookie': 'token',
    };


    this.http.get<any>(url, options)
    .subscribe((res => {
      this.workspaceList = res;
    }),
    err => {
      this.cookieService.deleteAll();
      alert('Failed on coockie varify! Please logging to get seesion!')
      window.location.assign('login') ;
    });
  }

  onClick(wsName: string) {
    this.router.navigate([`${wsName}`], {relativeTo: this.route});
  }

  // 跳轉到new頁面
  jumpToNew(){
    this.router.navigate(['manage/new'], {relativeTo: this.route});
  }



}

