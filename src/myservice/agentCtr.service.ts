import { Injectable } from '@angular/core';
import { Observable, Subject, from, pipe, Observer, Subscription, BehaviorSubject } from 'rxjs';
import { filter, map} from 'rxjs/operators';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient, HttpUploadProgressEvent, HttpHeaderResponse, HttpResponse, HttpEventType} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import {uploadProcess, UploadprocessList, AppUtilService} from './appUtility.service'
import {CytusAppStatus, CytusBatchStatus} from 'src/utility/CetusProtocol'

interface workspaceconfig {
    tensorflowVersion: string,
    GpuNum: number
}

export interface batchConfig {
  name: string,
  discription: string,
  commandTemplete: Array<CommandTemplete>,
  branchSet: Array<Branch>,
  status: 'waiting' | 'running' | 'completed' | 'terminate' | 'undefined'
}

export interface Branch {
  // this command list will support unique ui to set it
  CommandList: Array<Command>,
  logPath:string,
  podname: string,
  name:string,
  status: string,
  root: string,
  yamalPath: string
  timeStart: Date,
  timeEnd: Date
}

export interface CommandTemplete {
  command: string,
  optionMap: Array<string>
}

export interface Command {
  command: string,
  optionMap: Array<option>
}

export interface option {
  name: string,
  value: string, // if empty, its an boolean flag
}

/**
 * utility protocol
 */

// notifiction protocol
interface notification{
  type: 'Notification' | 'Error' | 'Warnning',
  title: string,
  detail:string
}

export interface task {
  name: string,
  group:string,
  action(): void,
  hotKet: string,
  description: string,
  isSuperTask: boolean
}

interface taskInterface {
  group: string,
  promptMassage: string,
  taskList: Array<task>;
}


@Injectable({
  providedIn: 'root'
})
export class agantCtr {
  // utility: 根據當前workspace自動更新
  currentFunctionId = new Subject<string>();
  cytusAppconfig = new BehaviorSubject<workspaceconfig>({tensorflowVersion: '', GpuNum: 0});
  currentWs = new Subject<string>();
  currentBranch = new BehaviorSubject<Branch>({name: 'Template'} as Branch);
  TaskList = new BehaviorSubject<Array<task>>([]);
  TaskPlaceHolder =  new BehaviorSubject<string>('None task...');
  ShowTaskList =  new BehaviorSubject<boolean>(false);
  isShowEditCompnent =  new BehaviorSubject<boolean>(false);
  isShowBranchManager =  new BehaviorSubject<boolean>(false);
  // fileupload
  // fs component add file(listen input-onchange)
  muteUploadProcessList = new BehaviorSubject<boolean>(false);
  uploadProcess = new Subject<Array<uploadProcess>>();

  // for fsArea display dir
  fileList = new Subject<any>();

  // processManager instance
  curUploadProcessManager: UploadprocessList;
  curUploadProcessSubsription: Subscription;
  taskInterface$: Array<taskInterface> = []
  TaskList$: Array<task>;
  batchConf$: batchConfig;
  // batchConf
  batchConf: BehaviorSubject<batchConfig> = new BehaviorSubject<batchConfig>({} as batchConfig)

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
      console.log('call getBatchConf() in currentWs sub')
      this.getBatchConf();
      // 從app service UploadprocessList 建立一個可觀察物件進行processlist的更新工作
      this.curUploadProcessManager = this.appCtr.registUploadProcess(wsname);
      this.curUploadProcessSubsription = this.curUploadProcessManager.uploadProcessList.subscribe(this.uploadProcessListObserver);
    })
    this.cytusAppconfig$.subscribe( config => {
      this.updateConfig(config)
    })
    this.TaskList.subscribe(list => {
      this.TaskList$ = list;
    })
    this.batchConf.subscribe(config => {
      this.batchConf$ = config as batchConfig;
      console.log({updateBatchInAgent: this.batchConf$})
      this.generateBranchSwitchTask(this.batchConf$.branchSet);
    })

    console.log('agent Service init')

  }

  generateBranchSwitchTask(branchSet: Array<Branch>) {
    console.log('create branch manager Task Success')
    console.log(branchSet)
    if(branchSet) {
      let taskList: Array<task> = branchSet.map(el => {
        return {
          name: el.name,
          group:'BranchManager',
          hotKet: '',
          action: () => {
            this.currentBranch.next(el)
          },
          isSuperTask: false,
          description: 'try it!'
        } as task;
      })

      taskList.push({
        name: 'Template',
          group:'BranchManager',
          hotKet: '',
          action: () => {
            this.currentBranch.next({name: 'Template'} as Branch)
          },
          isSuperTask: true,
          description: 'try it!'
        } as task
      )
  
      this.taskRegist('BranchManager', 'Click to switch', taskList);
    }
  }

  taskRegist(group: string, promptMassage, list: Array<task>){
    let isSet = false;
    for(let el of this.taskInterface$) {
      if(el.group == group) {
        this.taskInterface$.splice(this.taskInterface$.indexOf(el), 1, {
          group: group,
          promptMassage: promptMassage,
          taskList: list
        } as taskInterface)
        this.TaskList.next(el.taskList);
        isSet = true;
      }
    }

    if(isSet) {
      return;
    }
    else{
      console.log('not quit in taskRegist')
      this.taskInterface$.push({
        group: group,
        promptMassage: promptMassage,
        taskList: list
      } as taskInterface)
      console.log(this.taskInterface$)
      this.TaskList.next(this.taskInterface$[this.taskInterface$.length-1].taskList);

    }
  }

  fetchTaskList(group: string) {
    console.log('start Fatch task : ' + group)
    for(let el of this.taskInterface$) {
      if(el.group == group) {
        console.log({FetchTask: el})
        this.TaskPlaceHolder.next(el.promptMassage)
        this.TaskList.next(el.taskList);
        return
      }
    }

    // 若無此group
    this.TaskList.next([]);
  }

  taskUnRegist(groupname?: string){
    for(let el of this.taskInterface$) {
      if(el.group == groupname) {
        let index = this.taskInterface$.indexOf(el);
        this.taskInterface$.splice(index);
      }
    }

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
      console.log({config:data as workspaceconfig})
      this.cytusAppconfig.next(data as workspaceconfig);
    })
  }

  updateBatch_CommandTemplete(newcommandTemplete: Array<CommandTemplete>){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/setBatchConfig/${this.curWs}`

    let newconf = Object.assign(this.batchConf.getValue()) as batchConfig;
    // update batchConf
    newconf.commandTemplete = newcommandTemplete;

    console.log('update behaviorSub Inner value')
    console.log({batchConf: newconf})   
    this.batchConf.next(newconf) 

    
    // post
    this.http.post(url,
      newconf
      ,{
      headers: {
        'Content-Type' : 'application/json'
      },
      withCredentials:true,
    }).subscribe(data => {
    })
  }

  appendNewBranch(newBranchConfig: Branch) {
    let newconf = Object.assign(this.batchConf.getValue()) as batchConfig;
    newconf.branchSet = newconf.branchSet.concat([newBranchConfig]);
    this.updateBatch(newconf);
  }

  updateBranchSet(newBranchSet: Array<Branch>) {
    let newconf = Object.assign(this.batchConf.getValue()) as batchConfig;
    newconf.branchSet = newBranchSet;
    this.updateBatch(newconf);
    
  }

  DeleteBranch(target_Index: number) {
    let newconf = this.batchConf.getValue();
    newconf.branchSet = newconf.branchSet.slice(0, target_Index).concat(newconf.branchSet.slice(target_Index+1))
    this.updateBatch(newconf);
  }

  updateBatch(newconf: batchConfig){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/setBatchConfig/${this.curWs}`

    
    // post
    this.http.post(url,
      newconf
      ,{
      headers: {
        'Content-Type' : 'application/json'
      },
      withCredentials:true,
    }).subscribe(data => {
      this.batchConf.next(data as batchConfig);
    })
  }

  getBatchConf(){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/getBatchConfig/${this.curWs}`

    this.http.get(url, {
      headers: {
      },
      withCredentials:true
    }).subscribe(data => {
      this.batchConf.next(data as batchConfig);
      console.log({batchConfigGet: data})
    })
  }

  getCommandList(callBack?:(commandList: Array<string>) => void){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/getWorkspaceCommandList/${this.curWs}` ;

    let options = {
        withCredentials: true,
    };


    this.http.get<any>(url, options)
    .subscribe((res => {
      let source = res.commandList as Array<string>;
      if(callBack) {
        callBack(source);
      }
    }),
    err => {
      location.assign('/login')
    })
  }


  // addfile to upload queue
  stageUploadfile(relativePath:string, filelist:FileList) {

    let pathForexpress = ['root'].concat(relativePath.split('/')).join('>>');
    let url = `http://${environment.apiserver}/users/${this.userId}/${pathForexpress}/upload/${this.currentBranch.getValue().name}`

    for(let i = 0; i < filelist.length; i++){
      let form = new FormData();
      form.append("uploadfiles", filelist[i]);
      let data = {
        name: filelist[i].name,
        percent: 0,
        path: relativePath,
        hidden: false
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

  abortUploadProcess(process: uploadProcess) {
    // abort a process if not finished
    // hidden a process on list if finished
    // abort fetch api
    process.sub.unsubscribe();
    if(process.percent != 100) {
      let deletetargetDir = process.path.split('/').slice(1).join('/');
      this.deleteFile(deletetargetDir, process.name);
    }
    // remove from list
    let newList = this.curUploadProcessManager.uploadProcess$;
    let processIndex = newList.indexOf(process)
    newList[processIndex].hidden = true;
    newList[processIndex].percent = 100;
    this.curUploadProcessManager.uploadProcessList.next(newList);
  }


  deleteFile(relativepath:string, filename:string){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/deleteFile`;
    let payload = {
      WsName: this.curWs,
      relativepath: relativepath,
      filename:filename,
    };

    this.http.post<any>(url, payload, {
      headers: {
        'Content-Type' : 'application/json'},
      withCredentials:true,
      responseType: 'json',
      observe: 'response',
    }).subscribe(Response => {
      console.log(Response);

      if(!Response.ok) {
        alert('something wrong happens... reloadPage!')
      }
      else {
        alert('sucess delete!')
        this.fileList.next(Response.body)
      }
    })
  }

  // call back used in fn: stageUploadfile
  getUploadPercentage(event: HttpUploadProgressEvent) {
    return Math.round((event.loaded/event.total)*100)
  }

  deleteWs(){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/deleteWorkspace`;
    let payload = {
      WsName: this.curWs
    };

    this.http.post<any>(url, payload, {
      headers: {
        'Content-Type' : 'application/json'},
      withCredentials:true,
      responseType: 'json',
      observe: 'response',
    }).subscribe(Response => {
      console.log(Response);

      if(!Response.ok) {
        alert('something wrong happens... please reloadPage!')
      }

      location.reload();
    })
  }

  importWs(relativePath:string, filelist:FileList, target:HTMLInputElement) {
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/resetWorkspaceRoot/${this.curWs}`;
    this.http.get(url, {
      withCredentials:true,
      responseType: 'json',
      observe: 'response'
    }).subscribe( res => {
      if(res.ok) {
        this.stageUploadfile(relativePath, filelist);
        // reset
        target.value = '';
      }
      else{
        alert('something wrong happens... please reloadPage!')
      }
    })
  }

  loadCach() {
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/loadCachasWorkspaceRoot/${this.curWs}`;
    this.http.get(url, {
      withCredentials:true,
      responseType: 'json',
      observe: 'response'
    }).subscribe( res => {
      if(res.ok) {
        alert('cach load successfully!')
        console.log(res)
        this.fileList.next(res.body);
      }
      else{
        alert('something wrong happens... please reloadPage!')
      }
    })
  }

  cachWs() {
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/cachWorkspaceRoot/${this.curWs}`;

    this.http.get(url, {
      withCredentials:true,
      responseType: 'json',
      observe: 'response'
    }).subscribe( res => {
      if(res.ok) {
        alert('cach set successfully!')
      }
      else{
        alert('something wrong happens... please reloadPage!')
      }
    })
  }

  runworkspace(){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/runWorkspace/${this.curWs}` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
        withCredentials: true,
    };


    this.http.get<any>(url, options)
    .subscribe((res => {
      let {message} = res;
      console.log(message)
      alert(message)
    }),
    err => {
      
    });
  }

  runwbatch(){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/runBatch/${this.curWs}` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
        withCredentials: true,
    };


    this.http.get<any>(url, options)
    .subscribe((res => {
      let {message} = res;
      console.log(message)
      alert(message)
    }),
    err => {
      alert('file!')
    });
  }

}
