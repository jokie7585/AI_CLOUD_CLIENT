import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient, HttpResponse, HttpEvent} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service' ;
import { cookieList} from 'src/utility/cookie' ;

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
  showUploader: boolean = false;


  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private cookieService: CookieService,) { }

  ngOnInit(): void {
    this.downloader = document.getElementById('Fsdownloader')
    this.wsName = this.route.snapshot.parent.paramMap.get('wsName')
    console.log(this.route.snapshot.paramMap)
    this.userId = this.cookieService.get(cookieList.userID);
    this.path.push(this.wsName);
    this.loadpath();
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

  getPath(name: string){

  }

  upload(){

  }

}
