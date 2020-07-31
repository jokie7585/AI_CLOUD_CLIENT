import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket'
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';

interface Fetchconfig {
  wsName: string, userId: string
}

export interface Line {
  content: string,
  isEditing: boolean
}

@Injectable({
  providedIn: 'root'
})
export class TexteditorService {

  content: Subject<Array<Line>> = new Subject<Array<Line>>();
  editingLine: Subject<Line> = new Subject<Line>();
  config: Subject<Fetchconfig> = new Subject<Fetchconfig>();

  content$: Array<Line> = [];
  editingLine$ : Line;
  config$ :Fetchconfig;
  

  constructor(private http: HttpClient) {
    this.content$ = [{content: '', isEditing: true}];
    this.editingLine$ = this.content$[0];
    this.config.subscribe(config => {
      this.config$ = config;
      this.initCommandList();
    })

    this.editingLine.subscribe(line => {
      this.editingLine$ = line;
    })
    
  }

  initByAgent(wsName:string, userId:string){
    this.config.next({wsName: wsName, userId:userId});
  }

  initCommandList(){

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
      
    });

  }

  // following are edotor methode
  eventProcess = (event: KeyboardEvent) =>{
    console.log('catch: ' + event.key)
    if(event.key != 'Enter' && event.key != 'Backspace' && event.altKey!= true && event.ctrlKey!=true) {
      this.editingLine$.content += event.key; 
    }
    else if(event.key == 'Enter') {
      this.subsitution();
    }
    else if(event.key == 'Backspace') {
      this.delete();
    }

    this.content.next(this.content$);
  }

  delete(){
    if(this.editingLine$.content.length > 0) {
      this.editingLine$.content = this.editingLine$.content.substr(0, this.editingLine$.content.length-1 )
    }
    else{
      if(this.content$.indexOf(this.editingLine$) > 0) {
        let removetarget: number = this.content$.indexOf(this.editingLine$)
        this.editingLine$ = this.content$[removetarget-1];
        this.content$ = this.content$.slice(0, removetarget).concat(this.content$.slice(removetarget+1));
      }
    }
  }

  subsitution(){
    let insertPoint = this.content$.indexOf(this.editingLine$);
    console.log(insertPoint)
    console.log(this.content$)
    this.content$ = this.content$.slice(0, insertPoint+1).concat({content:'', isEditing:true}, this.content$.slice(insertPoint+1));
    this.editingLine$.isEditing=false;
    this.editingLine.next(this.content$[insertPoint+1]);
    console.log(this.content$)
  }

  save(){
    console.log('on save')
    this.setCommandList();
  }
}
