import { Injectable } from '@angular/core';
import { Observable, Subject, from, Subscription, BehaviorSubject } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';
import {agantCtr, task} from 'src/myservice/agentCtr.service'

interface Fetchconfig {
  wsName: string, userId: string
}

export interface Line {
  content: string,
  columnOffset:Array<number>,
  colchroffset: Array<number>,
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
  targetMeasureEl: CanvasRenderingContext2D;
  inputTempArray$: string = '';
  renderlock$: boolean = false;
  renderingTempArrayContent:boolean = false;
  deleteMode:boolean = false;
  copyingLock$: boolean = false;
  cursorPosition:Subject<CursorPosition> = new BehaviorSubject<CursorPosition>({top:0, left:0});

  constructor(private http: HttpClient, private agantCtr: agantCtr) {
    // this.content$ = [{content: '', isEditing: true}];
    // this.editingLine$ = this.content$[0];
    this.config.subscribe(config => {
      this.config$ = config;
      let initLine = {content:'', columnOffset:[], colchroffset:[], elId:`texteditor-${Date.now()}`};
      let newcontent = [initLine];
      this.editingLine$ = initLine;
      this.editingCol$ = 0;
      console.log({resetContnt:newcontent})
      this.content.next(newcontent);
    })
    this.editingLine.subscribe(line => {
      // this.editingLine$ = line;
    })
    this.content.subscribe(content => {
      this.content$ = content;
    })
    this.editingCol.subscribe(val=> {
      this.editingCol$ = val;
    })
    // init editor dependency service
    this.registTask();
    
  }

  initByAgent(wsName:string, userId:string, targetInput:HTMLInputElement, targetMeasureEl:CanvasRenderingContext2D){
    this.config.next({wsName: wsName, userId:userId});
    this.targetInput=targetInput;
    this.targetMeasureEl = targetMeasureEl;
  }

  registTask() {
    this.agantCtr.taskRegist([
      {
        name: 'save',
        group: 'BashEditor',
        action: () => this.setCommandList(),
        hotKet: 'CTRL/metaKey + S'
      },
      {
        name: 'past',
        group: 'BashEditor',
        action: () => alert('Press CTRL/metaKey + V in Bash-editor directory!'),
        hotKet: 'CTRL/metaKey + V'
      },
      {
        name: 'redo',
        group: 'BashEditor',
        action: () => alert('Press CTRL/metaKey + V in Bash-editor directory!'),
        hotKet: 'CTRL/metaKey + X'
      },
      {
        name: 'undo',
        group: 'BashEditor',
        action: () => alert('Press CTRL/metaKey + V in Bash-editor directory!'),
        hotKet: 'CTRL/metaKey + Z'
      },
    ])
  }

  unregistTask() {
    this.agantCtr.taskUnRegist('BashEditor')
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
      this.formateClipboardDataAsInput(source.join('\n'));
    }),
    err => {
      
    })
  }

  updateCursorStack(newContent: string){
      //if deleteMode, not update
      if(this.deleteMode) {
        this.forceUpdateCursor();
        this.renderlock$ = false;
        return;
      } 
      
      console.log('updateOffsetAtCol: ' + this.editingCol$);
      if(this.editingLine$) {
        
          // 若console(script)尚未渲染到頁面上則不更新
          console.log('lenthOffsetArr: ' +this.editingLine$.columnOffset.length)
          let editingLineElBound = this.targetMeasureEl.measureText(newContent).width + this.editingLine$.columnOffset[0];
          let offset = editingLineElBound - this.editingLine$.columnOffset[this.editingLine$.columnOffset.length-1];
          // 被插入字元的寬度
          if(this.editingCol$ > 0) {
            this.editingLine$.colchroffset[this.editingCol$-1] = offset;
          }
          console.log('offset is: ' + offset);
          // 計算插入後影響的columnOffset的新數值
          for(let i = this.editingCol$; i< this.editingLine$.columnOffset.length; i ++) {
            console.log('updateChar: ' + this.editingLine$.content[this.editingCol$]);
            this.editingLine$.columnOffset[i] = offset + this.editingLine$.columnOffset[i-1];
          }
          // 在最右端插入新Colunm
          this.editingLine$.columnOffset[this.editingLine$.columnOffset.length] = editingLineElBound;
          console.log('lenthOffsetArr-after: ' +this.editingLine$.columnOffset.length)
          console.log({offsetArr: this.editingLine$.columnOffset})
        
      }
      console.log('end cursor stack set')

      if(!this.copyingLock$) {
        console.log('Set render lock: false')
        console.log('dispatch: NotEmptyEvent in updateCursorStack')
        this.renderlock$ = false;
        this.targetInput.dispatchEvent(new Event('NotEmptyEvent'))
        this.forceUpdateCursor();
      }
  }

  
  forceUpdateCursor(){
      if(this.editingLine$) {
        let targetEl = document.getElementById(this.editingLine$.elId);
        if(targetEl) {
          // targetEl.scrollIntoView(false);
          // 若console(script)尚未渲染到頁面上則不更新
          let editingLineElBound = targetEl.getBoundingClientRect();
          if(this.editingLine$.columnOffset[this.editingCol$]) {
            this.cursorPosition.next({left: this.editingLine$.columnOffset[this.editingCol$], top: editingLineElBound.top});
          }
          else{
            console.log(`found NAN offset at Col$: ${this.editingCol$} , fource update cursorOffsetStack`)
            this.cursorPosition.next({left: editingLineElBound.left, top: editingLineElBound.top});
            // 強制更新
            this.editingLine$.columnOffset[this.editingCol$]=editingLineElBound.left;
          }
        }
      }
      console.log('end cursor render')
  }

  selectColByMouse(event: MouseEvent) {
    // 取得目標元素
    // 更新editingline$
    // 計算editingCol$
  }

  setCommandList(): void{

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

  formateClipboardDataAsInput(data: string) {
    // 從目前的游標位置開始，將字串處理後插入
    this.targetInput.dispatchEvent(new Event('EditorCopyStart'));
    this.copyingLock$ = true;
    this.addToTempInputArray(data);
  }

  insertTextAtCurCol(text: string){
    if(text == '\n') {
      this.subsitution();
      return;
    } 
    console.log('preCol: '+ this.editingCol$);
    let newContent = this.editingLine$.content;
    console.log({prefix:newContent.slice(0, this.editingCol$), postFix: newContent.slice(this.editingCol$) })
    newContent = newContent.slice(0, this.editingCol$).concat(text,newContent.slice(this.editingCol$));
    // 計算插入完成後col的位置並更新content
    this.editingCol$ += text.length;
    console.log('afterCol: '+ this.editingCol$);
    this.editingLine$.content = newContent;
    // 計算cursor
    this.updateCursorStack(newContent)
  }

  // add temp
  addToTempInputArray(input: string) {
    this.inputTempArray$ += input;
    console.log('dispatch: NotEmptyEvent in addToTempInputArray');
    this.targetInput.dispatchEvent(new Event('NotEmptyEvent'))
  }

  processCharRender(){
    this.deleteMode = false;
    if(this.inputTempArray$.length > 0) {
      while( this.inputTempArray$.length > 0 ) {
        let char = this.inputTempArray$[0];
        this.inputTempArray$ = this.inputTempArray$.slice(1);
        console.log('render process of: ' + char)
        this.insertTextAtCurCol(char);
      }

      // 廣播到component內的subscribe
      this.content.next(this.content$);
      this.targetInput.dispatchEvent(new Event('EditorCopyEnd'));
    }
  }

  // following are edotor methode
  eventProcess = (event: KeyboardEvent) =>{
    if(this.renderlock$) return;
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
      if((event.key == 's' || event.key == 'S') && (event.ctrlKey || event.metaKey)) {
        this.setCommandList();
        event.preventDefault();
      }
    }
    

    this.forceUpdateCursor();
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
      // change editingLine
      this.editingLine$ = this.content$[curLineIndex-1];
      // process col
      if(!indirectCall ) {
        if(this.editingCol$ > this.content$[curLineIndex-1].content.length) {
          this.editingCol$ = this.content$[curLineIndex-1].content.length;
        }
      } 
      else{
        this.editingCol$ = this.editingLine$.content.length;
      }
    }
  }
  moveDownline(indirectCall?:boolean){
    let curLineIndex = this.content$.indexOf(this.editingLine$);
    if(curLineIndex < this.content$.length-1) {
      // change editingLine
      this.editingLine$ = this.content$[curLineIndex+1];
      // process col
      if(!indirectCall ) {
        if(this.editingCol$ > this.content$[curLineIndex+1].content.length) {
          this.editingCol$ = this.content$[curLineIndex+1].content.length;
        }
      } 
      else{
        this.editingCol$ = 0;
      }
    }
  }

  delete(){
    this.deleteMode = true;
    if(this.editingCol$ > 0) {
      let targetCol = this.editingCol$-1;
      let decreaseOffset = this.editingLine$.colchroffset[targetCol];
      // 內容處理
      let newLine = this.editingLine$.content;
      newLine = newLine.slice(0, this.editingCol$-1).concat(newLine.slice(this.editingCol$))
      this.editingLine$.content = newLine;
      // 處理offsetArray
      this.editingLine$.columnOffset = this.editingLine$.columnOffset.slice(0,this.editingCol$-1).concat(this.editingLine$.columnOffset.slice(this.editingCol$))
      this.editingLine$.colchroffset = this.editingLine$.colchroffset.slice(0,this.editingCol$-1).concat(this.editingLine$.colchroffset.slice(this.editingCol$))
      // 處理offsetArray值更新
      for(let i = targetCol; i < this.editingLine$.columnOffset.length; i++) {
        this.editingLine$.columnOffset[i] -= decreaseOffset;
      }
      
      // 更新editingCol
      this.editingCol$ = targetCol;
    }
    else {
      let editingLineindex = this.content$.indexOf(this.editingLine$);
      if(editingLineindex > 0) {
        this.content$ = this.content$.slice(0, editingLineindex).concat(this.content$.slice(editingLineindex+1))
        this.editingLine$ = this.content$[editingLineindex-1];
        this.editingCol$ = this.editingLine$.content.length;
      }
    }
    this.content.next(this.content$);
  }

  subsitution(){
    let insertPoint = this.content$.indexOf(this.editingLine$);
    console.log(insertPoint)
    console.log(this.content$)
    this.content$ = this.content$.slice(0, insertPoint+1).concat({content:'', colchroffset:[], columnOffset:[this.editingLine$.columnOffset[0]], elId: `${this.elIdPredix}${Date.now()}`}, this.content$.slice(insertPoint+1));
    this.editingLine$ = this.content$[insertPoint+1];
    console.log(this.content$)
    this.editingCol$ = 0;

    if(!this.copyingLock$) {
      this.content.next(this.content$);
    }
  }
}
