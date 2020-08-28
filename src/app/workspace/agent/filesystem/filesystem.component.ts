import { Component, OnInit, OnDestroy, AfterViewChecked,Injector } from '@angular/core';
import { createCustomElement} from '@angular/elements';
import {CircleProgressComponent} from 'src/app/util/circle-progress/circle-progress.component'
import { ActivatedRoute } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient, HttpResponse, HttpEvent} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import { agantCtr } from 'src/myservice/agentCtr.service';
import { uploadProcess } from 'src/myservice/appUtility.service';
import { TerminalService, TerminalLine } from 'src/myservice/terminal.service';
import { TexteditorService, CursorPosition, Line } from 'src/myservice/texteditor.service';
import { subscribeOn } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { createComfirmStream } from 'src/utility/protocol';


interface data {
  name: string
  type: string
}


@Component({
  selector: 'app-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrls: ['./filesystem.component.css'],
})
export class FilesystemComponent implements OnInit, AfterViewChecked,OnDestroy {

  wsName: string = null;
  userId: string = '';
  path: Array<string> = [];
  dirList: Array<data> = [];
  showNoFileBoard:boolean = false;
  downloader: HTMLElement;
  uploader: HTMLInputElement;
  importor: HTMLInputElement;
  showUploadList: boolean = false;
  showUploadListFn: boolean = false; // 交替顯示progressbar&removeBottun
  muteUploadList: boolean = false;
  uploadList: Array<uploadProcess> = [];
  // subsription
  muteUploadListSub: Subscription;
  dirListSub: Subscription;
  uploadListSub: Subscription;
  scriptContentSub: Subscription;
  TerminalContentSub: Subscription;
  AllSub: Array<Subscription> = [];
  // clipboard
  clipbaordDisplay: string = 'none';
  clipboard: HTMLInputElement;
  cilpboardCordinate: {top: number, left: number} = {top:0, left:0}
  // script / terminal
  showconsole: boolean = false;
  showTerminal: boolean = false;
  // script: Array<Line>;
  script: Element;
  scriptContent: Array<Line>;
  scriptHight: number;
  sciptInput: HTMLInputElement;
  scriptContentCalculator: HTMLCanvasElement;
  cursorCoordinate: CursorPosition;
  showCursor: boolean = true;
  cursorStyleChangeInterval = undefined;
  titleBackground: string = 'rgb(122, 119, 119)';
  // terminal 元件相關
  terminal: Element
  TerminalContent: Array<TerminalLine> = null;
  terminalHight: number;
  terminalContentScrollTop: number;
  isTerminalTraceLastLine: boolean = true;
  IsmuteTerminalButtom: string = 'all'
  // 計算滑鼠位移的量需要的變數
  orign_y: number = 0;
  ontrace: boolean = false;

  showimportoption: boolean = false;

  


  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private cookieService: CookieService,
              private agent: agantCtr,
              private editorCtr: TexteditorService,
              private terminalCtr: TerminalService,
              injector: Injector
              ) { 
                
              }

  ngOnInit(): void {
    // script&terminal
    this.terminal = document.getElementById('fsTerminal')
    this.terminalHight = this.terminal.clientHeight;
    this.script = document.getElementById('fsScript')
    this.scriptHight = this.script.clientHeight;
    // 介接editor需要的event
    this.sciptInput = document.getElementById('fsScriptInput')  as HTMLInputElement;
    this.scriptContentCalculator = document.getElementById('scriptContentCalculator')  as HTMLCanvasElement;
    this.scriptContentCalculator.getContext('2d').font = 'normal 16px monospace '
    console.log({width: this.scriptContentCalculator.getContext('2d').measureText('123')})
    // this.sciptInput.addEventListener('compositionend', (event)=> {
    //   console.log('catch compositionend')
    //   this.sciptInput.dispatchEvent(new Event('change'))
    // })
    this.sciptInput.addEventListener('input', (event)=> {
      let e = event as InputEvent
      console.log('catch inputEvent of: '+ e.inputType)
      if(e.inputType == 'insertText') {
        this.editorCtr.addToTempInputArray(this.sciptInput.value)
        this.sciptInput.value='';
      }
      else{
        if(event.composed) {
          alert(`Do not support this input(${event.composed}):`  + this.sciptInput.value)
          this.sciptInput.value = ''
        }
      }
      
    })
    this.sciptInput.addEventListener('NotEmptyEvent', (event) => {
      this.editorCtr.processCharRender();
    })
    this.sciptInput.addEventListener('rendered', (event) => {
      // 這邊主要是處理delete的cursor計算
      this.editorCtr.updateCursorStack('');
    })
    this.sciptInput.addEventListener('keydown', (event) => {
      clearInterval(this.cursorStyleChangeInterval);
      this.showCursor = true;
      this.editorCtr.eventProcess(event);
    })
    this.sciptInput.addEventListener('keyup', ()=>{
      this.setCousorBehavior();
    })
    this.sciptInput.addEventListener('EditorCopyEnd', ()=> {
      console.log('catch event: Editor EditorCopyEnd')
      this.editorCtr.copyingLock$ = false;
    })
    this.sciptInput.addEventListener('EditorCopyStart', ()=> {
      console.log('catch event: Editor CopyStart')
      // this.copyingLock$ = true;
      this.showCursor = false;
    })
    this.sciptInput.onpaste = (event) => {
      event.preventDefault();
      this.editorCtr.formateClipboardDataAsInput(event.clipboardData.getData('text'));
    }

    // up/downloader
    this.downloader = document.getElementById('Fsdownloader')
    this.uploader = document.getElementById('FsUploader') as HTMLInputElement
    this.importor = document.getElementById('FsWsImportor') as HTMLInputElement
    this.clipboard = document.getElementById('fsClipboard') as HTMLInputElement
    // 相依性資訊設定
    this.wsName = this.route.snapshot.parent.paramMap.get('wsName')
    this.userId = this.cookieService.get(cookieList.userID);
    this.path.push(this.wsName);
    this.loadpath();
    this.editorCtr.content.subscribe(data => {
      this.scriptContent = data;
      console.log('Set render lock: true')
      this.editorCtr.renderlock$ = true;
    })
    // set subscribe
    this.dirListSub = this.agent.fileList.subscribe(data => {
      console.log('update fs list')
      console.log({fs:data})
      this.dirList = data;
      if(this.dirList.length > 0) {
       this.showNoFileBoard = false; 
      }
    })
    this.uploadListSub = this.agent.curUploadProcessManager.uploadProcessList.subscribe((list) => {
      console.log('in get new process list')
      console.log({prelist: this.uploadList})
      console.log({icommingList: list})
      if(this.muteUploadList == false) {
        if(list.length > 0) {
          this.showUploadList = true
        }
        else {
          this.showUploadList = false;
        }
      }
   
      this.uploadList = list;
    })

    this.muteUploadListSub = this.agent.muteUploadProcessList.subscribe(val => {
      this.muteUploadList = val;
      if(val === true) {
        let allComplete = true;
        for(let el of this.uploadList) {
          if(el.percent != 100) {
            allComplete = false;
          }
        }
        if(allComplete) {
          this.agent.curUploadProcessManager.uploadProcessList.next([])
        }
        this.showUploadList = false;
      }
      else{
        if(this.uploadList.length > 0) {
          this.showUploadList = true;
        }
      }
    })

    this.TerminalContentSub = this.terminalCtr.simulateLog.subscribe(data=> {
      this.TerminalContent = data;
    })

    this.AllSub.push(this.editorCtr.cursorPosition.subscribe(cor=>{
      this.cursorCoordinate = cor;
      this.sciptInput.dispatchEvent(new Event('forceUpdtaeView'))
      console.log({curCursor:cor} )
    }))

    // init service
    this.editorCtr.initByAgent(this.wsName, this.userId, this.sciptInput, this.scriptContentCalculator.getContext('2d'));
    this.terminalCtr.initByAgent(this.wsName, this.userId);
  }

  ngOnDestroy(){
    console.log('On filesystem.component destroy')
    this.dirListSub.unsubscribe();
    this.uploadListSub.unsubscribe();
    this.TerminalContentSub.unsubscribe();
    this.muteUploadListSub.unsubscribe();
    this.AllSub.forEach(el=>{
      el.unsubscribe();
    })
  }

  ngAfterViewChecked(){
    console.log('update')
    if(this.isTerminalTraceLastLine) {
      // console.log('trace log last line')
      this.terminal.scrollTo({top:this.terminal.scrollHeight})
      // 更新terminalContentScrollTop為最新的值
      this.terminalContentScrollTop = this.terminal.scrollTop
    }
    if(this.editorCtr.renderlock$) {
      if(this.editorCtr.deleteMode) {
        console.log('dispatch: rendered in ngAfterViewChecked');
        this.sciptInput.dispatchEvent(new Event('rendered'));
      }
      else{
        this.editorCtr.renderlock$=false;
        this.editorCtr.forceUpdateCursor();
      }
    }
  }

  muteAll(){
    console.log('event bubble to muteall')
    this.clipbaordDisplay='none'
    setTimeout(()=>{
      if(document.activeElement !== this.sciptInput) {
        console.log('timeout rendering')
        this.titleBackground = 'rgb(184, 184, 184)'
      }
    },10)
  }

  muteUploadModule(){
    this.agent.muteUploadProcessList.next(true)
  }

  deleteProcess(process: uploadProcess){
    // 隱藏fnc，為了處理無法觸發在close-fnc 上的onleave事件造成的UI問題
    this.showUploadListFn = false;
    this.agent.removeUploadProcess(process)
  }

  hidProgressbar(){
    this.showUploadListFn = true;
  }

  hideCloseButtom(){
    this.showUploadListFn = false;
  }

  // terminal/script controll

  /** enable trace offset of mouse(from oring of mousedown) */
  ZoomTerminal(event: MouseEvent) {
    this.ontrace = true;
    console.log('set oring')
  }

  UnZoomTerminal(event: MouseEvent) {
    this.ontrace = false;
    this.sciptInput.focus();
    console.log(this.terminalHight)
  }

  traceMouse = (event: MouseEvent) => {
    if(this.ontrace) {
      console.log(this.terminalHight, event.clientY)
      if(this.showTerminal) {
        this.terminalHight = window.innerHeight - event.clientY;
      }
      else{
        this.scriptHight = window.innerHeight - event.clientY;
      }
    }
  }

  getHight() {
    let hight = 0;
    if(this.showTerminal || this.showconsole) {
      if(this.showTerminal) {
        hight = this.terminalHight;
      }
      else{
        hight = this.scriptHight;
      }

      return `${hight}px`
      
    }

    return `20vh`

  }

  isTraceTerminalLastLine(event: WheelEvent){
    console.log({
      scrollHeight: this.terminal.scrollHeight,
      scrollTop: this.terminal.scrollTop,
      selfRecoedScrollTop: this.terminalContentScrollTop
    })
    // 記錄新的terminal.scrollTop as event.deltaY
    this.terminalContentScrollTop += event.deltaY;
    // 只要我們自己手動記錄的this.terminalContentScrollTop不等於元素真正的scrollTop則不trancelastLine
    if(this.terminalContentScrollTop < this.terminal.scrollTop) {
      this.isTerminalTraceLastLine = false;
    }
    else{
      this.isTerminalTraceLastLine = true;
      // 超過的部分要還原成真正的scrollTop
      this.terminalContentScrollTop=this.terminal.scrollTop;
    }

    console.log(this.isTerminalTraceLastLine)
  }

  // fsArea
  iconSelector(type: string) {
    if(type === 'dir') {
      return 'assets/directory.svg'
    }

    return 'assets/file.svg'
  }

  exeuteClick(file: data){
    if(file.type === "dir") {
      this.path.push(file.name);
      this.loadpath()
    }
    else {
      
    }
    
  }

  preDir(){
    if(this.path.length > 1) {
      this.path = this.path.slice(0, -1);
      this.loadpath()
    }
  }

  loadpath(){
    let path = ['root'].concat(this.path);
    let pathURL: string = encodeURI(path.join('>>'));
    let url = `http://${environment.apiserver}/users/${this.userId}/${pathURL}` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
        withCredentials: true,
        'Cookie': 'token',
    };


    this.http.get<any>(url, options)
    .subscribe((res => {
      this.dirList = res;
      if(this.dirList.length > 0) {
        this.showNoFileBoard = false;
      }
      else{
        this.showNoFileBoard = true;
      }
    }),
    err => {
      window.location.assign('login')
    });
  }

  download(name: string){
    let path = ['root'].concat(this.path);
    let pathURL: string = encodeURI(path.join('>>'));
    let url:string = `http://${environment.apiserver}/users/${this.userId}/${pathURL}/${name}/download`

    this.http.get(url, {
      headers: {
      },
      withCredentials:true,
      responseType: "blob",
      observe: "response",
    }).subscribe( Response => {
      if(Response.ok) {
        console.log(Response)
        let filename = Response.headers.get('Content-Disposition').match(/"(.*)"/)[1];
        // 生成blobURL 透過a標籤 處理檔案下載
        let blobURL = URL.createObjectURL(Response.body);
        this.downloader.setAttribute('href', blobURL);
        this.downloader.setAttribute('download', filename);
        this.downloader.click();
        window.URL.revokeObjectURL(blobURL);
    }
    })

  }

  setmyclipboard(event: MouseEvent,name?: string){
    if(this.clipbaordDisplay == 'flex') {
      this.clipbaordDisplay='none'
    }
    else{
      event.stopPropagation();
      let ablulotePh = this.path.slice(1);
      let path = '/mnt/' + ablulotePh.join('/');

      if(name) {
        path = '/mnt/' + ablulotePh.concat(name).join('/');
      }
      let bottum: HTMLElement = event.target as HTMLElement;
      // forced update view
      this.clipboard.value = path; 
      this.cilpboardCordinate.left = bottum.offsetLeft+20
      this.cilpboardCordinate.top = bottum.offsetTop+15
      this.clipbaordDisplay = 'flex'
    }
    
  }

  getpath(event:Event){
    event.preventDefault();
    this.clipboard.select();
    document.execCommand('COPY')
    this.editorCtr.MyClipBoard = this.clipboard.value;
    console.log('copyed')
    this.clipbaordDisplay='none'
  }

  upload(event: Event){
    this.agent.muteUploadProcessList.next(false);
    console.log('onchange is called')
    let target: HTMLInputElement = event.target as HTMLInputElement;
    this.agent.stageUploadfile(this.path.join('/'), target.files);
    target.value='';
  }

  totgleimportOption(){
    this.showimportoption = !this.showimportoption;
  }

  startImport() {
    this.showimportoption = !this.showimportoption;
    this.importor.click();
  }

  loadCach(){
    this.showimportoption = !this.showimportoption;
    this.agent.loadCach()
  }

  startCach() {
    this.agent.cachWs();
  }

  import(event: Event){
    this.agent.muteUploadProcessList.next(false);
    this.agent.importWs(this.path.join('/'), this.importor.files, this.importor);
  }

  openTerminal(){
    this.showconsole = false;
    this.showTerminal = !this.showTerminal;
    if(this.showTerminal) {
      this.terminalCtr.getLogs()
    }
  }

  openScripWriter(){
    this.showTerminal = false;
    this.showconsole = !this.showconsole;
    if(this.showconsole == true) {
      // 重要細節！！！ docuent的執行scope不在此context內，因此用arrow綁定
      this.editorCtr.initCommandList()
      this.sciptInput.focus()
      // closure
      // this.cursorStyleChangeInterval = setInterval(() => {
      //   this.showCursor = !this.showCursor;
      // },1000)
      // this.editorCtr.forceUpdateCursor()
      // document.onkeydown = this.listenKeyEvent;
    }
    else{
      // clearInterval(this.cursorStyleChangeInterval);
      // document.onkeydown = ()=>{};
    }
    
  }

  setCousorBehavior(){
    clearInterval(this.cursorStyleChangeInterval);
    this.cursorStyleChangeInterval = setInterval(() => {
      this.showCursor = !this.showCursor;
    },500)
  }

  FocusScript(){
    this.setCousorBehavior();
    this.titleBackground = 'rgb(122, 119, 119)';
    setTimeout(() => {
      this.editorCtr.forceUpdateCursor();
    }, 1);
    
  }

  UnFocusScript(){
    clearInterval(this.cursorStyleChangeInterval);
    this.showCursor = false
  }

  focusFsConsole(){
    this.sciptInput.focus()
  }

  listenKeyEvent = (event: KeyboardEvent) =>{
    this.editorCtr.eventProcess(event);
  }

  isShow(isShow: boolean):string{
    if(isShow) {
      return 'flex'
    }

    return 'none'
  }

  variftComment(content: string){
    if(content[0] == '#') {
      return 'green'
    }
    return '#c4c4c4'
  }

  runworkspace(){
    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/runWorkspace/${this.wsName}` ;

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

}
