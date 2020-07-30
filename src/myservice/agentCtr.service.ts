import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';


interface workspaceconfig {
    tensorflowVersion: string,
    GpuNum: number
}

interface uploadingProcess {
  name: string,
  path: string,
  fragment: number,
  finish_fragment: number,
}

@Injectable({
  providedIn: 'root'
})
export class agantCtr {

  uploadSocket: WebSocketSubject<any>;
  currentFunctionId = new Subject<string>();
  cytusAppconfig = new Subject<workspaceconfig>();
  currentWs = new Subject<string>();
  // fs component add file(listen input-onchange)
  fileUploadList = new Subject<FileList>();
  // show on upload dashboard
  uploadingProcess = new Subject<Array<uploadingProcess>>();

  // create stream
  currentFunctionId$ = this.currentFunctionId.asObservable();
  cytusAppconfig$ = this.cytusAppconfig.asObservable();

  // defineAsync
  constructor(private http: HttpClient){
    this.uploadSocket = webSocket({
      url: environment.fileSocketServer
    });
    this.cytusAppconfig$.subscribe( config => {
        // 串接後端api (post)
    })
    this.uploadSocket.subscribe(msg => {
      
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

  // addfile to upload queue
  stageUploadfile(relativePath:string, filelist:FileList) {

  }

  // generate upload process from file upload queue
  assignProcess(relativePath:string, file:File){

  }
  // process SolidSocketFrame
  // send

  // comfirme

}
