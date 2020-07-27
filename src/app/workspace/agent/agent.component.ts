import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {agantCtr} from 'src/myservice/agentCtr.service'

interface Appfunction {
  fs: string;
  history: string;
  setting: string;
}

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.css']
})
export class AgentComponent implements OnInit {
  userId: string = '';
  wsName: string = null;
  appfunc: Appfunction = {
    fs: 'filesystem',
    history: 'history',
    setting: 'setting'
  }
  currentFunctionId: string = this.appfunc.fs;


  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private router: Router,
              private cookieService: CookieService,
              private agentCtr: agantCtr) { }

  ngOnInit(): void {
    this.agentCtr.currentFunctionId$.subscribe(id => {
      document.getElementById(this.currentFunctionId).setAttribute('class', 'function');
      document.getElementById(id).setAttribute('class', 'function-seleted');
      this.currentFunctionId = id;
    })
    document.getElementById(this.currentFunctionId).setAttribute('class', 'function-seleted');
    this.userId = this.cookieService.get(cookieList.userID);
    this.wsName = this.route.snapshot.parent.paramMap.get('wsName');
  }

  seleteFunction(htmlId: string){
    this.agentCtr.seletFuction(htmlId);
    this.router.navigate([htmlId], {relativeTo: this.route});
  }

  jumpWorkspace(){
    window.location.assign('workspace')
  }

}
