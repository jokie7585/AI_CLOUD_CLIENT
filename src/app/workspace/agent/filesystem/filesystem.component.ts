import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';
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
  path: string = '';
  dirList: Array<data> = [];


  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private cookieService: CookieService,) { }

  ngOnInit(): void {
    this.wsName = this.route.snapshot.parent.paramMap.get('wsName')
    console.log(this.route.snapshot.paramMap)
    this.userId = this.cookieService.get(cookieList.userID);
    this.path = this.wsName;
    this.loadpath();
  }

  cd(file: data){
    if(file.type === "dir") {
      this.path = this.path.concat(`>>${file.name}`)
    }
    this.loadpath()
  }

  preDir(){
    this.path
  }

  loadpath(){
    let pathURL: string = encodeURI('root>>'.concat(this.path));
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

}
