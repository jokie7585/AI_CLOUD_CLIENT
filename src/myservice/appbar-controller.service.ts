import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {Router, RouterModule} from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import {socketService} from './socket.service'

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
              private http: HttpClient,
              private router: Router,
              private socket: socketService){
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
    this.http.get(`http://${environment.apiserver}/api/auth/singOut/${this.userId}`,{
      withCredentials: true,
    }).subscribe( body => {
      let {message} = body as any
      alert(message);
      this.cookieService.deleteAll();
      this.socket.websocket.unsubscribe()
    this.guestMode();
    this.router.navigate(['login']);
    }
    );
  }


}
