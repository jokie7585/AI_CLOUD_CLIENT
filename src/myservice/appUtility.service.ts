import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import {webSocket} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;


/**
 * process managemet interface
 */

interface WsProcessManager {
  upProcessList: Array<UploadprocessList>
}

export interface UploadprocessList {
  Wsname: string,
  uploadProcessList: BehaviorSubject<Array<uploadProcess>>,
  uploadProcess$: Array<uploadProcess>
}

export interface uploadProcess {
  name: string,
  path: string,
  percent: number,
  sub: Subscription,
  hidden: boolean
}

/**
 * app notifycation
 */

 interface notifycation{
   title: string,
   detail: string,
   routerlink:string,
 }

@Injectable({
  providedIn: 'root'
})
export class AppUtilService {
  // SubjectList
  /**
   * wsProcessManager: manage inner app process; only works from app-start to app-end
   * 
   * @importantMesage
   *   wsProcessManager 並不會自行管理驗證提交上來的各種資訊，僅僅作為一個Observeable而已。
   */
  wsProcessManager =  new BehaviorSubject<WsProcessManager>({
    upProcessList: []
  });

  // bindedData(old/beforNext value of observeable) 
  wsProcessManager$: WsProcessManager;

  /**
   * Websocket
   * 
   * 
   */
  websocket = webSocket<any>(environment.socket);


  constructor(){
    console.log('appUtility service init')
    // 綁定oberver
    this.wsProcessManager.subscribe((wsProcessManager) => {
      this.wsProcessManager$ = wsProcessManager;
      console.log({newwsProcessManager: this.wsProcessManager$})
    })
  }

  /**
   * 
   * @param WsName 
   */

   init(){
     console.log('init appUtility.service')
   }

  /**
   * inner app process management
   */

   /**
    * registUploadProcess can regist a app-scope upload process record
    * 
    * @param WsName 
    */
   registUploadProcess(WsName: string): UploadprocessList{
    for (let el of this.wsProcessManager$.upProcessList) {
      // 若有已存在之記錄，返回 指定的instance
      if(el.Wsname == WsName) {
        console.log('found process list:' + el.Wsname + '===' + WsName)
        return el;
      }
    }
    // 若無以存在之記錄，生成新的 UploadprocessList for WsName
    let newUploadprocessList = {
      Wsname: WsName,
      uploadProcessList: new BehaviorSubject<Array<uploadProcess>>([]),
      uploadProcess$: []
    } as UploadprocessList
    // 綁定最新值在$上
    newUploadprocessList.uploadProcessList.subscribe((list)=> {
      newUploadprocessList.uploadProcess$ = list;
    })
    // 加入 wsProcessManager 中
    console.log('create new uploadProcessList of: ' + WsName);
    this.wsProcessManager$.upProcessList.push(newUploadprocessList);
    this.wsProcessManager.next(this.wsProcessManager$);
    // 回傳instance
    return newUploadprocessList;
   }

   /**
    * 當使用者要關閉網頁時，透過 `isNoRunningProcess` 先檢查所有背景程序或request是否已經完成
    */
   isNoRunningProcess():boolean {
     return false;
   }

   
}
