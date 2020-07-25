import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service' ;
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { cookieList} from 'src/utility/cookie' ;
import {AppbarControllerService} from 'src/myservice/appbar-controller.service'

// Constant
import { appPath } from './app-path.const';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppbarControllerService]
})
export class AppComponent implements OnInit{
  path = appPath;
  showWorkspaceFunction: boolean = false ;
  showSingInUp: boolean = true ;

  constructor(private cookieService: CookieService,
              private router: Router,
              private appbarCtr:AppbarControllerService) {}

  jumpHome(){
    this.router.navigate([''])
  }

  ngOnInit() {
    console.log(this.showSingInUp)
    this.appbarCtr.showWorkspaceFunction$.subscribe((value) => {
      this.showWorkspaceFunction = value;
      console.log('accept change: showWorkspaceFunction')
    });
    this.appbarCtr.showSingInUp$.subscribe( (value) => {
      this.showSingInUp = value;
      console.log('accept change: showSingInUp')
    })
    let id: string = this.cookieService.get(cookieList.userID);
    if(id != '') {
      this.appbarCtr.userMode();
      console.log(this.showSingInUp)
      this.router.navigate([appPath.workspace])
    }
    else {
      this.appbarCtr.guestMode()
    }
  }
}

