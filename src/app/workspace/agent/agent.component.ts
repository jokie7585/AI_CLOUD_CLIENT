import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {agantCtr, task} from 'src/myservice/agentCtr.service'
import { socketService } from 'src/myservice/socket.service';
import {AppbarControllerService} from 'src/myservice/appbar-controller.service';
import { Subscription } from 'rxjs';

interface Appfunction {
  fs: string,
  history: string,
  setting: string,
  batch: string,
  overview: string
}

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.css']
})
export class AgentComponent implements OnInit, OnDestroy {
  userId: string = '';
  wsName: string = null;
  curbranch: string = null;
  appfunc: Appfunction = {
    fs: 'filesystem',
    history: 'history',
    setting: 'setting',
    batch: 'Batch',
    overview: 'Overview'
  }
  currentFunctionId: string = this.appfunc.fs;
  // statusbar
  // uploadManager
  isMuteUploadList: boolean;
  isHasRunningUploadProcess:boolean;
  //  notificationManager
  isHasNotification:boolean = false;
  showNotificationList:boolean = false;
  showTaskList: boolean = true;
  isShowEditCompnent: boolean = false;
  isShowBranchManager: boolean = false;
  // taskManager
  taskList$: Array<task>
  supertaskList$: Array<task>
  TaskPlaceHolder$: string = '';
  curTask: string = '';
  // subscription
  allSub: Array<Subscription> = [];

  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private router: Router,
              private cookieService: CookieService,
              public agentCtr: agantCtr,
              private appCtr:AppbarControllerService,
              
              private socketService: socketService) { }

  ngOnInit(): void {
    console.log('agent component init Start!')
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
    this.agentCtr.switchWs(this.wsName);
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
    this.allSub.push(
      this.agentCtr.TaskList.subscribe(list => {
        
          this.taskList$ = list.filter(el => {
            return el.isSuperTask != true
          });

          this.supertaskList$ = list.filter(el => {
            return el.isSuperTask == true
          });
      })
    )
    this.allSub.push(
      this.agentCtr.TaskPlaceHolder.subscribe(list => {
        this.TaskPlaceHolder$ = list;
      })
    )
    this.allSub.push(
      this.agentCtr.ShowTaskList.subscribe(val => {
        this.showTaskList = val;
      })
    )
    this.allSub.push(
      this.agentCtr.isShowEditCompnent.subscribe(val => {
        this.isShowEditCompnent = val;
      })
    )
    this.allSub.push(
      this.agentCtr.isShowBranchManager.subscribe(val => {
        this.isShowBranchManager = val;
      })
    )
    this.allSub.push(
      this.agentCtr.currentBranch.subscribe(val => {
        this.curbranch = val.name;
      })
    )

    console.log('agent component init End!')
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

  togleTaskManager(task: string) {
    event.stopPropagation();
    if(task == this.curTask) {
      this.agentCtr.ShowTaskList.next(!this.showTaskList);
    }
    else {
      this.agentCtr.ShowTaskList.next(true);
      this.agentCtr.fetchTaskList(task)
      this.curTask = task;
    }
  }

  muteTaskManager(){
    this.agentCtr.ShowTaskList.next(false);
  }


}
