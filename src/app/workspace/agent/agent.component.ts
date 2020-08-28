import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {agantCtr} from 'src/myservice/agentCtr.service'
import { uploadProcess } from 'src/myservice/appUtility.service';
import {AppbarControllerService} from 'src/myservice/appbar-controller.service';
import { Subscription } from 'rxjs';

interface Appfunction {
  fs: string;
  history: string;
  setting: string;
}

// notifiction protocol
interface notification{
  type: 'Notification' | 'Error' | 'Warnning',
  title: string,
  detail:string
}

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.css']
})
export class AgentComponent implements OnInit, OnDestroy {
  userId: string = '';
  wsName: string = null;
  appfunc: Appfunction = {
    fs: 'filesystem',
    history: 'history',
    setting: 'setting'
  }
  currentFunctionId: string = this.appfunc.fs;
  isMuteUploadList: boolean;
  isHasRunningUploadProcess:boolean;
  isHasNotification:boolean = false;
  showNotificationList:boolean = false;

  // subscription
  allSub: Array<Subscription> = [];

  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private router: Router,
              private cookieService: CookieService,
              private agentCtr: agantCtr,
              private appCtr:AppbarControllerService) { }

  ngOnInit(): void {
    this.appCtr.Closefooter();
    this.agentCtr.currentFunctionId$.subscribe(id => {
      document.getElementById(this.currentFunctionId).setAttribute('class', 'function');
      document.getElementById(id).setAttribute('class', 'function-seleted');
      this.currentFunctionId = id;
    })
    document.getElementById(this.currentFunctionId).setAttribute('class', 'function-seleted');
    this.userId = this.cookieService.get(cookieList.userID);
    this.wsName = this.route.snapshot.parent.paramMap.get('wsName');
    // 改變agent所代理的Ws(使set, get Api 針對目前正瀏覽的Ws做操作)
    this.agentCtr.currentWs.next(this.wsName);
    this.allSub.push(
      this.agentCtr.muteUploadProcessList.subscribe((val) => {
        this.isMuteUploadList = val;
      })
    )
    this.allSub.push(
      this.agentCtr.curUploadProcessManager.uploadProcessList.subscribe((val) => {
        for(let i = 0; i < val.length ; i++) {
          if(val[i].percent != 100) {
            return this.isHasRunningUploadProcess = true;
          }
        }
        this.isHasRunningUploadProcess = false;
      })
    )
  }

  ngOnDestroy(){
    // unsub
    this.allSub.forEach(el => {
      el.unsubscribe();
    })
  }

  seleteFunction(htmlId: string){
    this.agentCtr.seletFuction(htmlId);
    this.router.navigate([htmlId], {relativeTo: this.route});
  }

  togleMuteUploadList() {
    this.agentCtr.muteUploadProcessList.next(!this.isMuteUploadList);
  }

  togleNotifycation(){
    this.showNotificationList = !this.showNotificationList;
  }

  jumpWorkspace(){
    this.router.navigate(['workspace'])
  }

}
