import { Injectable } from '@angular/core';
import { Observable, Subject, from, BehaviorSubject } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient, HttpResponse} from '@angular/common/http';

interface Fetchconfig {
  wsName: string, userId: string
}

export interface TerminalLine {
  content: string
}

@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  content: Subject<Array<TerminalLine>> = new Subject<Array<TerminalLine>>();
  config: Subject<Fetchconfig> = new Subject<Fetchconfig>();
  simulateLog :BehaviorSubject<Array<TerminalLine>> = new BehaviorSubject<Array<TerminalLine>>([{content:''}]);
  

  content$: Array<TerminalLine> = [];
  config$ :Fetchconfig;
  endLog$ : boolean = false;
  Intervel;
  logEnding:false;
  

  constructor(private http: HttpClient) {
    this.content$ = [{content: ''}];
    this.config.subscribe((config)=> {
        this.config$ = config
    })
    this.content.subscribe(data => {
        let sumulateLog = '';
            let logStorage = data
            let NewconsoleSimulatLog: Array<TerminalLine> = [];
            logStorage.forEach((el,index) => {
                let samlineOutput = el.content.split('\r');

                samlineOutput.forEach(el=>{
                    if(el.length >= sumulateLog.length) {
                        sumulateLog = el;
                    }
                    else {
                        sumulateLog = el.concat(sumulateLog.slice(el.length))
                    }
                })

                let temp = sumulateLog;
                // 將處理好的log加入儲存中
                NewconsoleSimulatLog.push({content: temp});
                // console.log('previous: ' + el);
                // console.log('after: ' + temp);
                // 初始化
                sumulateLog = '';
            })
            this.simulateLog.next(NewconsoleSimulatLog);
    
  })

}


  initByAgent(wsName:string, userId:string){
      console.log('init terminal')
      this.config.next({wsName: wsName, userId:userId});
  }

  initLogProcess(){

  }

  getLogs(errProcessFuc){

    // if not getting logs

    let url = `http://${environment.apiserver}/users/${this.config$.userId}/management/api/getWorkspaceLog/${this.config$.wsName}` ;


    this.http.get(url, {
        responseType: 'json',
        observe: 'response',
        withCredentials: true,
      })
    .subscribe((res => {
      console.log(res);
        let isLogEnd = res.headers.get('X-AICLOUD-ENDLOG');
        let {logs} = res.body as any;
        let textStream = logs as string;
        let arr = textStream.split('\n')
            this.content$ = arr.map(el => {
                return {
                    content: el,
                    isEditing:false
                } as TerminalLine
            })
            this.content.next(this.content$);
            let that = this;
            setTimeout(function() {
              if(isLogEnd==='true') {
              }
              else{
                that.getLogs(errProcessFuc)
              }
            }, 1000)
      
    
    }),
    err => {
        console.log(err);
        let {message} = err.error
        alert(message)
        errProcessFuc();
    });
  }
  
}
