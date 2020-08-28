import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {Router} from '@angular/router'
import { domain } from 'process';

@Injectable({
  providedIn: 'root'
})
export class AppbarControllerService {

  showWorkspaceFunction = new Subject<boolean>();
  showSingInUp = new Subject<boolean>();
  showFooter = new BehaviorSubject<boolean>(true);
  userId: string = '';
  
  

  // create stream
  showWorkspaceFunction$ = this.showWorkspaceFunction.asObservable();
  showSingInUp$ = this.showSingInUp.asObservable();

  constructor(private cookieService: CookieService,
              private router: Router){
    this.userId = this.cookieService.get(cookieList.userID);
  }
 

  userMode() {
    this.showSingInUp.next(false);
    this.showWorkspaceFunction.next(true);
    console.log('user mode render')
  }

  guestMode() {
    this.showSingInUp.next(true);
    this.showWorkspaceFunction.next(false);
    console.log('guest mode render')
  }

  Showfooter(){
    this.showFooter.next(true);
  }
  
  Closefooter(){
    this.showFooter.next(false);
  }

  signOut(){
    this.cookieService.delete('userid')
    this.router.navigate(['login']);
    this.guestMode();
  }

}
