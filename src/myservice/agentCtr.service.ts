import { Injectable } from '@angular/core';
import { Observable, Subject, from, pipe, Observer, Subscription, BehaviorSubject } from 'rxjs';
import { filter, map} from 'rxjs/operators';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient, HttpUploadProgressEvent, HttpHeaderResponse, HttpResponse, HttpEventType} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {uploadProcess, UploadprocessList, AppUtilService} from './appUtility.service'

interface workspaceconfig {
    tensorflowVersion: string,
    GpuNum: number
}


@Injectable({
  providedIn: 'root'
})
export class agantCtr {
  // utility: 根據當前workspace自動更新
  currentFunctionId = new Subject<string>();
  cytusAppconfig = new Subject<workspaceconfig>();
  currentWs = new Subject<string>();
  Clipboard = new Subject<string>();
  // fileupload
  // fs component add file(listen input-onchange)
  muteUploadProcessList = new BehaviorSubject<boolean>(false);
  uploadProcess = new Subject<Array<uploadProcess>>();

  // for fsArea display dir
  fileList = new Subject<any>();

  // processManager instance
  curUploadProcessManager: UploadprocessList;
  curUploadProcessSubsription: Subscription;

  // observerList
  uploadProcessListObserver: Observer<Array<uploadProcess>> = {
    next: (newList)=> {
      console.log('processlist update')
      this.uploadProcess.next(newList);
    },
    error: ()=> {

    },
    complete: ()=> {
      console.log('end of listening uploadprocess list');
    }
  }
  

  // create stream
  currentFunctionId$ = this.currentFunctionId.asObservable();
  cytusAppconfig$ = this.cytusAppconfig.asObservable();

  /** 
   * bindedData(old/beforNext value of observeable) 
  */ 
  // wagentLevel - 當訪問的workspace改變時，再agent.component onInit時改變
  userId: string = '';
  curWs: string = '';
  cytusappconfig: workspaceconfig;

  // defineAsync
  constructor(private cookieService: CookieService,
              private http: HttpClient,
              private appCtr: AppUtilService){
    this.userId = this.cookieService.get(cookieList.userID);
    
    this.currentWs.subscribe( wsname => {
      // 先清除上一個workspace的Subscription
      if(this.curUploadProcessSubsription) {
        this.curUploadProcessSubsription.unsubscribe();
      }
      // 當 workspace 切換時，載入相依資訊與相依設定
      this.muteUploadProcessList.next(false);
      this.curWs = wsname
      this.getConfig();
      // 從app service UploadprocessList 建立一個可觀察物件進行processlist的更新工作
      this.curUploadProcessManager = this.appCtr.registUploadProcess(wsname);
      this.curUploadProcessSubsription = this.curUploadProcessManager.uploadProcessList.subscribe(this.uploadProcessListObserver);
    })
    this.cytusAppconfig$.subscribe( config => {
      this.updateConfig(config)
    })

    console.log('agent Service init')

  }

  // agent status
  seletFuction(htmlId: string) {
    this.currentFunctionId.next(htmlId);
  }
  
  // Cytusconfig
  setConfig(config: workspaceconfig): void {
    this.cytusAppconfig.next(config);
  }
  updateConfig(config: workspaceconfig){
    this.cytusappconfig = config;
    // start api calling
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/SetWorkspaceConfig/${this.curWs}`
    this.http.post(url,
      config
      ,{
      headers: {
        'Content-Type' : 'application/json'
      },
      withCredentials:true,
    }).subscribe(data => {
    })
  }

  getConfig(){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/getWorkspaceConfig/${this.curWs}`
    this.http.get(url, {
      headers: {
      },
      withCredentials:true
    }).subscribe(data => {
      this.cytusAppconfig.next(data as workspaceconfig);
    })
  }

  // addfile to upload queue
  stageUploadfile(relativePath:string, filelist:FileList) {

    let pathForexpress = ['root'].concat(relativePath.split('/')).join('>>');
    let url = `http://${environment.apiserver}/users/${this.userId}/${pathForexpress}/upload`

    for(let i = 0; i < filelist.length; i++){
      let form = new FormData();
      form.append("uploadfiles", filelist[i]);
      let data = {
        name: filelist[i].name,
        percent: 0,
        path: relativePath
      } as uploadProcess

      this.curUploadProcessManager.uploadProcess$.push(data);
      let stamp = this.curUploadProcessManager.uploadProcess$.indexOf(data);
      // 先將目前的執行環境閉包
      let curUploadProcessManager = this.curUploadProcessManager;


      data.sub = this.http.post(url,
        form
        ,{
        headers: {
        },
        withCredentials:true,
        reportProgress: true,
        observe:'events'
      })
      .subscribe(data => {
        
        if(data.type === HttpEventType.Response) {
          this.fileList.next(data.body)
        }
        else if(data.type === HttpEventType.UploadProgress) {
          let process = curUploadProcessManager.uploadProcess$[stamp] as uploadProcess
          process.percent = this.getUploadPercentage(data as HttpUploadProgressEvent);
          // 更新observeable source 的值
          // this.uploadProcess.next(newlist);
          curUploadProcessManager.uploadProcessList.next(curUploadProcessManager.uploadProcess$);
        }
      })

    }
  }

  // call back used in fn: stageUploadfile
  getUploadPercentage(event: HttpUploadProgressEvent) {
    return Math.round((event.loaded/event.total)*100)
  }

  // remove uploadprocess(if not finish upload, then abort request)
  removeUploadProcess(process :uploadProcess) {
    process.sub.unsubscribe();
    let newList = this.curUploadProcessManager.uploadProcess$;
    let processIndex = newList.indexOf(process)
    console.log({curList: newList});
    newList = newList.slice(0, processIndex).concat(newList.slice(processIndex+1));
    console.log({nextList: newList});
    this.curUploadProcessManager.uploadProcessList.next(newList);
  }

}
