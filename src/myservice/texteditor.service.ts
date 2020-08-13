import { Injectable } from '@angular/core';
import { Observable, Subject, from, Subscription, BehaviorSubject } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';

interface Fetchconfig {
  wsName: string, userId: string
}

export interface Line {
  content: string,
  isEditing: boolean,
  elId:string,
}

export interface CursorPosition {
  left: number,
  top: number
}

@Injectable({
  providedIn: 'root'
})
export class TexteditorService {

  content: Subject<Array<Line>> = new Subject<Array<Line>>();
  editingLine: Subject<Line> = new Subject<Line>();
  editingCol: Subject<number> = new Subject<number>();
  config: Subject<Fetchconfig> = new Subject<Fetchconfig>();

  content$: Array<Line> = [];
  editingCol$: number;
  editingLine$ : Line;
  config$ :Fetchconfig;
  MyClipBoard: string = '';

  // const
  elIdPredix:string = 'texteditor-';
  
  // 相關html元素的config
  // 專門負責input處理的元素
  targetInput:HTMLInputElement;
  cursorPosition:Subject<CursorPosition> = new BehaviorSubject<CursorPosition>({top:0, left:0});

  constructor(private http: HttpClient) {
    // this.content$ = [{content: '', isEditing: true}];
    // this.editingLine$ = this.content$[0];
    this.config.subscribe(config => {
      this.config$ = config;
      let initLine = {content:'', isEditing:true, elId:`texteditor-${Date.now()}`};
      this.content$ = [initLine];
      this.editingLine$ = initLine;
      this.editingCol$ = 0;
      console.log({resetContnt:this.content$})
      this.initCommandList();
    })
    this.editingLine.subscribe(line => {
      this.editingLine$ = line;
    })
    this.content.subscribe(content => {
      this.content$ = content;
      this.forceUpdateCursor();
    })
    this.editingCol.subscribe(val=> {
      this.editingCol$ = val;
    })
    
  }

  initByAgent(wsName:string, userId:string, targetInput:HTMLInputElement){
    this.config.next({wsName: wsName, userId:userId});
    this.targetInput=targetInput;
  }

  initCommandList(){
    let url = `http://${environment.apiserver}/users/${this.config$.userId}/management/api/getWorkspaceCommandList/${this.config$.wsName}` ;

    let options = {
        withCredentials: true,
    };


    this.http.get<any>(url, options)
    .subscribe((res => {
      let source = res.commandList as Array<string>;
      console.log({initscript: source})
      this.formateStringAsInput(source.join('\n'));
      this.content.next(this.content$);
    }),
    err => {
      
    })
  }

  forceUpdateCursor(){
    setTimeout(()=> {
      if(this.editingLine) {
        let targetEl = document.getElementById(this.editingLine$.elId);
        if(targetEl) {
          // 若console(script)尚未渲染到頁面上則不更新
          let editingLineElBound = targetEl.getBoundingClientRect();
          let calculateLeft = editingLineElBound.left+ 8 + this.editingCol$ * 10 ;
          this.cursorPosition.next({left: calculateLeft, top: editingLineElBound.top});
        }
      }
    }, 10)
  }

  setCommandList(){

    let url = `http://${environment.apiserver}/users/${this.config$.userId}/management/api/setWorkspaceCommandList/${this.config$.wsName}` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
        withCredentials: true,
    };

    let payload = this.content$.map(el=>{
      return el.content.trim();
    })


    this.http.post<any>(url,{commandList:payload}, options)
    .subscribe((res => {
      console.log(res)
    }),
    err => {
      
    })

  }

  formateStringAsInput(data: string) {
    // 從目前的游標位置開始，將字串處理後插入
    let source = data.split('\n');
    console.log({initScriptString:source})
    for(let i = 0; i < source.length-1; i++) {
      this.insertTextAtCurCol(source[i]);
      this.subsitution();
    }
    if(source.length > 0) {this.insertTextAtCurCol(source[source.length-1])}
    this.forceUpdateCursor();
  }

  insertTextAtCurCol(text: string){
    console.log('preCol: '+ this.editingCol$);
    let newContent = this.editingLine$.content;
    console.log({prefix:newContent.slice(0, this.editingCol$), postFix: newContent.slice(this.editingCol$) })
    newContent = newContent.slice(0, this.editingCol$).concat(text,newContent.slice(this.editingCol$));
    // 計算插入完成後col的位置
    this.editingCol$ += text.length;
    console.log('afterCol: '+ this.editingCol$);
    this.editingLine$.content = newContent;
  }

  // following are edotor methode
  eventProcess = (event: KeyboardEvent) =>{
    console.log('catch: ' + event.key)
    if(!event.altKey && !event.ctrlKey && !event.metaKey) {
      if(event.key == 'Enter') {
        this.subsitution();
      }
      else if(event.key == 'Backspace') {
        this.delete();
      }
      else if(event.key == 'ArrowLeft') {
        this.moveleftCol();
      }
      else if(event.key == 'ArrowRight') {
        this.moveRightCol();
      }
      else if(event.key == 'ArrowUp') {
        this.moveUpline();
      }
      else if(event.key == 'ArrowDown') {
        this.moveDownline();
      }
      // else{
      //   console.log('catchWriteable: ' + event.key)
      //   setTimeout(()=>{
      //     this.targetInput.dispatchEvent(new Event('change'))
      //   }, 10)
      // }
    }
    else{
      event.preventDefault();
      if((event.key == 's' || event.key == 'S') && (event.ctrlKey || event.metaKey)) {
        this.setCommandList();
      }
      else if((event.key == 'v' || event.key == 'V') && (event.ctrlKey || event.metaKey)) {
        this.formateStringAsInput(this.MyClipBoard);
      }
    }
    

    this.content.next(this.content$);
  }

  moveRightCol(){
    if(this.editingCol$ < this.editingLine$.content.length) {
      this.editingCol$ += 1;
    }
    else{
      this.moveDownline(true)
    }
  }

  moveleftCol(){
    if(this.editingCol$ > 0) {
      this.editingCol$ -= 1;
    }
    else{
      this.moveUpline(true);
    }
  }

  moveUpline(indirectCall?:boolean){
    let curLineIndex = this.content$.indexOf(this.editingLine$);
    console.log({curLine: curLineIndex})
    if(curLineIndex > 0) {
      // process col
      if(this.editingCol$ > this.content$[curLineIndex-1].content.length && !indirectCall ) {
        this.editingCol$ = this.content$[curLineIndex-1].content.length;
      }
      else{
        this.editingCol$ = this.content$[curLineIndex-1].content.length;
      }
      // change editingLine
      this.editingLine.next(this.content$[curLineIndex-1]);
    }
  }
  moveDownline(indirectCall?:boolean){
    let curLineIndex = this.content$.indexOf(this.editingLine$);
    if(curLineIndex < this.content$.length-1) {
      // process col
      if(this.editingCol$ > this.content$[curLineIndex+1].content.length ) {
        this.editingCol$ = this.content$[curLineIndex+1].content.length;
      }
      // change editingLine
      this.editingLine.next(this.content$[curLineIndex+1]);
    }
  }

  delete(){
    if(this.editingCol$ > 0) {
      let newLine = this.editingLine$.content;
      newLine = newLine.slice(0, this.editingCol$-1).concat(newLine.slice(this.editingCol$))
      this.editingLine$.content = newLine;
      this.editingCol$ -= 1;
    }
    else {
      let editingLineindex = this.content$.indexOf(this.editingLine$);
      if(editingLineindex > 0) {
        this.content$ = this.content$.slice(0, editingLineindex).concat(this.content$.slice(editingLineindex+1))
        this.editingLine$ = this.content$[editingLineindex-1];
        this.editingCol$ = this.editingLine$.content.length;
      }
    }
  }

  subsitution(){
    let insertPoint = this.content$.indexOf(this.editingLine$);
    console.log(insertPoint)
    console.log(this.content$)
    this.content$ = this.content$.slice(0, insertPoint+1).concat({content:'', isEditing:true, elId: `${this.elIdPredix}${Date.now()}`}, this.content$.slice(insertPoint+1));
    this.editingLine$.isEditing=false;
    this.editingLine.next(this.content$[insertPoint+1]);
    console.log(this.content$)
    this.editingCol$ = 0;
  }
}
