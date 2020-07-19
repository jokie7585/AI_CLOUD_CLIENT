import { Component, OnInit } from '@angular/core';
import { Template } from '@angular/compiler/src/render3/r3_ast';
import {WSPath} from './workspace-path.const' ;
import { CookieService } from 'ngx-cookie-service' ;
import { NumberSymbol } from '@angular/common';
import { cookieList} from 'src/utility/cookie' ;

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],

})

export class WorkspaceComponent implements OnInit {
  private cookieValue: string ;

  wspath = WSPath ;
  title = 'Tour of Heroes';
  heroes: Array<string> = ['Windstorm', 'Bombasto', 'Magneta', 'Tornado'];
  myHero = this.heroes[0];
  datanum: Array<number> = [1, 2, 3, 4, 5 ];
  sum  = 0 ;
  master = 'Master' ;

  constructor(private cookieService: CookieService) { }

  plus(){
    this.sum = this.sum + 1 ;
    this.cookieService.set('LIST', JSON.stringify(this.datanum) ) ;
    this.cookieService.set(cookieList.WS_SUM, this.sum.toString() ) ;
    alert(this.sum) ;
  }

  getsum(){
    this.cookieValue = this.cookieService.get(cookieList.WS_SUM) ;
    alert(this.cookieValue) ;
  }


  public ngOnInit(): void {
    this.sum = Number.parseInt(this.cookieService.get(cookieList.WS_SUM), 10);
    if ( Number.isNaN(this.sum) ) {
      this.sum = 0;
    }
  }



}

