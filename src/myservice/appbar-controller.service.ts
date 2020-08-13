import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AppbarControllerService {

  showWorkspaceFunction = new Subject<boolean>();
  showSingInUp = new Subject<boolean>();
  showFooter = new Subject<boolean>();
  

  // create stream
  showWorkspaceFunction$ = this.showWorkspaceFunction.asObservable();
  showSingInUp$ = this.showSingInUp.asObservable();
 

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
  closefooter(){
    this.showFooter.next(false);
  }

}
