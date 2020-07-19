import { Component, OnInit, Input } from '@angular/core';
import { CookieService} from 'ngx-cookie-service' ;
import { from } from 'rxjs';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {
  private cookieValue: string ;
  list: Array<number>;
  constructor(private cookieService: CookieService) { }

  helloworld(){
    alert(this.cookieValue) ;
  }


public ngOnInit(): void {
  this.cookieValue = this.cookieService.get('cookie-sum') ;
  this.list = JSON.parse(this.cookieService.get('LIST')) ;
  }

}
