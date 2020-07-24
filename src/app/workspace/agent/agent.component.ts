import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.css']
})
export class AgentComponent implements OnInit {
  userId: string = '';
  wsName: string = null;


  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private router: Router,
              private cookieService: CookieService,) { }

  ngOnInit(): void {
    this.userId = this.cookieService.get(cookieList.userID);
    this.wsName = this.route.snapshot.parent.paramMap.get('wsName')
    document.getElementById('fsFunction').setAttribute('class', 'function-seleted')
    this.router.navigate(['filesystem'], {relativeTo: this.route});
  }

  jumpWorkspace(){
    window.location.assign('workspace')
  }

}
