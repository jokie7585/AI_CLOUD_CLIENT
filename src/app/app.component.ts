import { Component } from '@angular/core';

// Constant
import { appPath } from './app-path.const';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  path = appPath;
  WorkSpaceAppbarPlace: boolean = false ;
  StaticAppbarPlace: boolean = true ;

  WorkSpcaeAppbarChange(){
    this.WorkSpaceAppbarPlace = true ;
    this.StaticAppbarPlace = false ;
    console.log( " this.WorkSpaceAppbarPlace " );
  }

  HomeAppbarChange(){
    this.WorkSpaceAppbarPlace = false ;
    this.StaticAppbarPlace = true ;
  }
}

