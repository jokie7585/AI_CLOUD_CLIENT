import { Component, OnInit, Injector } from '@angular/core';
import { createCustomElement} from '@angular/elements';
import { CookieService } from 'ngx-cookie-service' ;
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { cookieList} from 'src/utility/cookie' ;
import {AppbarControllerService} from 'src/myservice/appbar-controller.service'
import {CircleProgressComponent} from 'src/app/util/circle-progress/circle-progress.component'

// Constant
import { appPath } from './app-path.const';
import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppbarControllerService]
})
export class AppComponent implements OnInit{
  path = appPath;
  showWorkspaceFunction: boolean = false ;
  showUserDropedown: boolean = false;
  showSingInUp: boolean = true ;
  showFooter:boolean;
  userId: string = '';

  // detailcard
  show_detailcard: boolean = false;
  detailcard_text: string = '';
  detailcard_refLink: string = '';

  constructor(private cookieService: CookieService,
              private router: Router,
              private appbarCtr:AppbarControllerService,
              injector: Injector) {
              }

  ngOnInit() {
    this.userId = this.appbarCtr.userId;
    console.log(this.showSingInUp)
    this.appbarCtr.showWorkspaceFunction$.subscribe((value) => {
      this.showWorkspaceFunction = value;
      console.log('accept change: showWorkspaceFunction')
    });
    this.appbarCtr.showSingInUp$.subscribe( (value) => {
      this.showSingInUp = value;
      console.log('accept change: showSingInUp')
    });
    this.appbarCtr.showFooter.subscribe( value =>{
      this.showFooter = value;
      console.log('accept change: showFooter: ' + value)
    });
    let id: string = this.cookieService.get(cookieList.userID);
    if(id != '') {
      this.appbarCtr.userMode();
      this.appbarCtr.Closefooter();
      console.log(this.showSingInUp)
      this.router.navigate([appPath.workspace])
    }
    else {
      this.appbarCtr.guestMode()
    }

    console.log('appbar inited!')
  }

  jumpHome(){
    if(this.showWorkspaceFunction) {
      this.router.navigate(['workspace']);
      return
    }
    this.router.navigate(['']);
  }

  muteAll(){
    this.showUserDropedown=false;
  }

  jumpWorkspace(){
    this.showUserDropedown = false;
    this.router.navigate(['workspace']);
  }

  jumpOverview(){
    this.showUserDropedown = false;
    this.router.navigate(['workspace/manage/overview']);
  }

  toggleUserDropdeown(){
    this.showUserDropedown = !this.showUserDropedown;
  }

  signOut(){
    this.appbarCtr.signOut();
  }
}

