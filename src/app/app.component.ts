import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service' ;
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { cookieList} from 'src/utility/cookie' ;

// Constant
import { appPath } from './app-path.const';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  path = appPath;
  showWorkspaceFunction: boolean = false ;
  showSingInUp: boolean = true ;

  constructor(private cookieService: CookieService,private router: Router,) {}

  WorkSpcaeAppbarChange(){
    this.showWorkspaceFunction = true ;
    this.showSingInUp = false ;
    console.log( " this.WorkSpaceAppbarPlace " );
  }

  showGuestMode(){
    this.showWorkspaceFunction = false ;
    this.showSingInUp = true ;
  }

  jumpHome(){
    this.router.navigate([''])
  }

  ngOnInit() {
    let token = this.cookieService.get('token')
    console.log(token)
    if(token !== '') {
      this.WorkSpcaeAppbarChange();
      this.router.navigate(['workspace'])
    }
    else{
      this.showGuestMode()
    }
  }
}

