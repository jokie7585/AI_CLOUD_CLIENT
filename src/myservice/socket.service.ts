import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import {webSocket} from 'rxjs/webSocket'
import {agantCtr} from 'src/myservice/agentCtr.service'
import {environment} from 'src/environments/environment' ;
import {socketReponse, forceUpdate} from 'src/utility/SocketProtocol'


@Injectable({
  providedIn: 'root'
})
export class socketService {
  // SubjectList
  

  /**
   * Websocket
   * 
   * 
   */
  websocket = webSocket<any>(environment.socket);


  constructor(public agentCtr: agantCtr){
    console.log('socket service init')
    // socket subscribe
    this.websocket.subscribe(
      onMsg => {
        let res = onMsg as socketReponse
        console.log({incommingSocketRes: res})
        if(res.action === 'message') {
          console.log({socketMessage: res.body})
        }
        else if (res.action === 'update') {
          console.log('in forceupdate')
          console.log({peekAgentCurWs: this.agentCtr.curWs})
          console.log({peekAgentCuruserid: this.agentCtr.userId})
          console.log({peekAgent: this.agentCtr.batchConf$})
          let body = res.body as forceUpdate
          if(body.target === 'batchComponent') {
              console.log('in forceupdate batchComponent')
            this.agentCtr.getBatchConf()
          }
        }
      },
      err => {

      },
      () => {
        console.log()
      }
    )
  }

  /**
   * 
   * @param WsName 
   */

   init(){
     console.log('init socket.service')
   }

   peekAgentCtr() {
    console.log({peekAgentCurWs: this.agentCtr.curWs})
    console.log({peekAgentCuruserid: this.agentCtr.userId})
    console.log({peekAgent: this.agentCtr.batchConf$})
   }
  

   
}
