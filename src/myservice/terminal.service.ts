import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';

interface Fetchconfig {
  wsName: string, userId: string
}

interface Line {
  content: string,
  isEditing: boolean
}

@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  content: Subject<Array<Line>> = new Subject<Array<Line>>();
  config: Subject<Fetchconfig> = new Subject<Fetchconfig>();
  simulateLog :Subject<Array<Line>> = new Subject<Array<Line>>();

  content$: Array<Line> = [];
  config$ :Fetchconfig;
  

  constructor(private http: HttpClient) {
    this.content$ = [{content: '', isEditing: true}];
    this.config.subscribe((config)=> {
        this.config$ = config
    })
    this.content.subscribe(data => {
        let sumulateLog = '';
            let logStorage = data
            let NewconsoleSimulatLog: Array<Line> = [];
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
                NewconsoleSimulatLog.push({content: temp, isEditing: false});
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

  getLogs(){

    let url = `http://${environment.apiserver}/users/${this.config$.userId}/management/api/getWorkspaceLog/${this.config$.wsName}` ;


    this.http.get<Response>(url, {
         headers: {
          },
          withCredentials: true,
          observe: "response"
          
      })
    .subscribe((res => {
      let isLogEnd = res.headers.get('X-AICLOUD-ENDLOG');

      res.body.blob()
      .then(fileBlob => {
        fileBlob.text()
        .then(textStream => {
            let arr = textStream.split('\n')
            this.content$ = arr.map(el => {
                return {
                    content: el,
                    isEditing:false
                } as Line
            })
            this.content.next(this.content$);
            if(!isLogEnd) {
                this.getLogs()
            }
        })
        
    })
    }),
    err => {
        console.log(err);
        let {message} = err
        alert(message)
    });

  }
  
}
