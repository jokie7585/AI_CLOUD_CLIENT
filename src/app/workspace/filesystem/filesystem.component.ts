import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {environment} from 'src/environments/environment' ;
import {HttpClient} from '@angular/common/http';

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

  WorkspaceList: Array<data> = [];
  userId: string = null;


  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.getWSLIST();
  }

  getWSLIST(){

    let url = `http://${environment.apiserver}/users/${this.userId}/management/api/loadWorkspaceList` ;

    let options = {
      headers: {
        'Content-Type' : 'application/json'},
        withCredentials: true,
        'Cookie': 'token',
    };


    this.http.get<any>(url, options)
    .subscribe((res => {
      this.WorkspaceList = res;
    }),
    err => {
      alert('no jwt')
    });
  }

}
