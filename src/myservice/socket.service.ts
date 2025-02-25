import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription, from } from 'rxjs';
import {webSocket} from 'rxjs/webSocket'
import {agantCtr, batchConfig} from 'src/myservice/agentCtr.service'
import {environment} from 'src/environments/environment' ;
import {socketReponse, forceUpdate} from 'src/utility/SocketProtocol'
import {AppUtilService} from 'src/myservice/appUtility.service'


@Injectable({
  providedIn: 'root'
})
export class socketService {
  // SubjectList
  
  batchConf: Subject<batchConfig> = new Subject<batchConfig>();
  /**
   * Websocket
   * 
   * 
   */
  websocket = webSocket<any>(environment.socket);


  constructor(public agentCtr: agantCtr,
              public appUtil:AppUtilService){


    // window.addEventListener('beforeunload' , (e) => {
    //     e.preventDefault();
    //     e.returnValue = 'onbeforeunload';

    //     console.log('fq')

    //     return 'bye!'
    // })

    

   

  }

  /**
   * 
   * @param WsName 
   */

   init(){
    console.log('socket service init')
    // socket subscribe
    let that = this;
    this.websocket.subscribe(
      onMsg => {
        let res = onMsg as socketReponse
        console.log({incommingSocketRes: res})
        if(res.action === 'message') {
          console.log({socketMessage: res.body})
        }
        else if (res.action === 'update') {
          console.log('in forceupdate')
          // console.log({peekAgentCurWs: this.agentCtr.curWs})
          // console.log({peekAgentCuruserid: this.agentCtr.userId})
          // console.log({peekAgent: this.agentCtr.batchConf$})
          let body = res.body as forceUpdate
          if(body.target === 'batchComponent') {
              console.log('in forceupdate batchComponent')
              this.agentCtr.batchConf.next(body.ws as batchConfig)
          }
          else if(body.target === 'nofification') {
            that.appUtil.GetNotificationList();
          }
        }
      },
      err => {

      },
      () => {
        console.log()
      }
    )
     console.log('init socket.service')
   }

   peekAgentCtr() {
    console.log({peekAgentCurWs: this.agentCtr.curWs})
    console.log({peekAgentCuruserid: this.agentCtr.userId})
    console.log({peekAgent: this.agentCtr.batchConf$})
   }
  

   
}
