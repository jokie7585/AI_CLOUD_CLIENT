import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient, HttpResponse, HttpEvent} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;
import { agantCtr } from 'src/myservice/agentCtr.service';
import { TerminalService } from 'src/myservice/terminal.service';
import { TexteditorService, Line } from 'src/myservice/texteditor.service';


interface data {
  name: string
  type: string
}


@Component({
  selector: 'app-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrls: ['./filesystem.component.css']
})
export class FilesystemComponent implements OnInit {

  wsName: string = null;
  userId: string = '';
  path: Array<string> = [];
  dirList: Array<data> = [];
  downloader: HTMLElement;
  uploader: HTMLInputElement;
  showUploadList: boolean = false;
  // clipboard
  clipbaordDisplay: string = 'none';
  clipboard: HTMLInputElement;
  cilpboardCordinate: {left: number, top:number} = {left:0, top:0}
  // script / terminal
  showconsole: boolean = false;
  // script: Array<Line>;
  script: HTMLTextAreaElement;
  scriptContent: Array<Line>;
  //
  showTerminal: boolean = false;
  TerminalContent: Array<Line>;


  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private cookieService: CookieService,
              private agent: agantCtr,
              private editorCtr: TexteditorService,
              private terminal: TerminalService,
              private ngzone: NgZone) { }

  ngOnInit(): void {
    this.agent.fileList.subscribe(data => {
      this.dirList = data;
    })
    this.script = document.getElementById('fsConsole-input') as HTMLTextAreaElement
    this.downloader = document.getElementById('Fsdownloader')
    this.uploader = document.getElementById('FsUploader') as HTMLInputElement
    this.clipboard = document.getElementById('fsClipboard') as HTMLInputElement
    this.wsName = this.route.snapshot.parent.paramMap.get('wsName')
    console.log(this.route.snapshot.paramMap)
    this.userId = this.cookieService.get(cookieList.userID);
    this.path.push(this.wsName);
    this.loadpath();
    // init service
    this.editorCtr.initByAgent(this.wsName, this.userId);
    this.terminal.initByAgent(this.wsName, this.userId);
    this.editorCtr.content.subscribe(data => {
      this.scriptContent = data;
    })

    this.terminal.simulateLog.subscribe(data=> {
      this.TerminalContent = data;
    })
  }

  muteAll(){
    this.clipbaordDisplay='none'
  }

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
      observe: "response"
    }).subscribe( Response => {
      if(Response.ok) {
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

  setmyclipboard(event: MouseEvent,name: string){
    event.stopPropagation();
    let path = this.path.concat(name).slice(1).join('/');
    let bottum: HTMLElement = event.target as HTMLElement;
    // forced update view
    this.clipboard.value = path; 
    this.cilpboardCordinate.left = bottum.offsetLeft+20
    this.cilpboardCordinate.top = bottum.offsetTop+10
    this.clipbaordDisplay = 'flex'
  }

  getpath(event:Event){
    event.preventDefault();
    this.clipboard.select();
    document.execCommand('COPY')
    this.clipbaordDisplay='none'
  }

  upload(event: Event){
    console.log('onchange is called')
    let target: HTMLInputElement = event.target as HTMLInputElement;
    this.agent.stageUploadfile(this.path.join('/'), target.files);
  }

  openTerminal(){
    this.showTerminal = !this.showTerminal;
    this.terminal.getLogs()
  }

  openScripWriter(){
    this.showconsole = !this.showconsole;
    if(this.showconsole == true) {
      // 重要細節！！！ docuent的執行scope不在此context內，因此用arrow綁定
      document.onkeydown = this.consolChange;
    }
    else{
      document.onkeydown = ()=>{};
    }
    
  }

  consolChange = (event: KeyboardEvent) =>{
    this.editorCtr.eventProcess(event);
  }

  saveScript(){
    this.showconsole = false;
    this.editorCtr.save()
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
