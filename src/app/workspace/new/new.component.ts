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
  Inputnewrepository: string ;
  list: Array<number>;
  constructor(private cookieService: CookieService) { }

  newrepository(){
    this.cookieService.set('newrepository', this.Inputnewrepository) ;
  }


public ngOnInit(): void {

  this.list = JSON.parse(this.cookieService.get('LIST')) ;
  }

}
