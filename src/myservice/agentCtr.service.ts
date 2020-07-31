import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;


interface workspaceconfig {
    tensorflowVersion: string,
    GpuNum: number
}

@Injectable({
  providedIn: 'root'
})
export class agantCtr {

  currentFunctionId = new Subject<string>();
  cytusAppconfig = new Subject<workspaceconfig>();
  currentWs = new Subject<string>();
  Clipboard = new Subject<string>();
  // fs component add file(listen input-onchange)
  fileUploadList = new Subject<FileList>();
  fileList = new Subject<any>();
  

  // create stream
  currentFunctionId$ = this.currentFunctionId.asObservable();
  cytusAppconfig$ = this.cytusAppconfig.asObservable();

  // data
  userId: string = '';
  curWs: string = '';
  cytusappconfig: workspaceconfig;


  // defineAsync
  constructor(private cookieService: CookieService,private http: HttpClient){
    this.userId = this.cookieService.get(cookieList.userID);
    
    this.currentWs.subscribe( wsname => {
      this.curWs = wsname
      this.getConfig();
    })
    this.cytusAppconfig$.subscribe( config => {
      this.updateConfig(config)
    })

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
    console.log('in set conf:' + this.curWs)
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
      console.log(data)
    })
  }

  getConfig(){
    console.log('in get conf:' + this.curWs)
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
    let form = new FormData();
    for(let i = 0; i < filelist.length; i++){
      form.append("uploadfiles", filelist[i]);
    }

    let pathForexpress = ['root'].concat(relativePath.split('/')).join('>>');
    let url = `http://${environment.apiserver}/users/${this.userId}/${pathForexpress}/upload`
    this.http.post(url,
      form
      ,{
      headers: {
      },
      withCredentials:true,
    }).subscribe(data => {
      this.fileList.next(data);
    })
    
    
    
  }

}
