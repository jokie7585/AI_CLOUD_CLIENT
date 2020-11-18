import { Component, OnInit } from '@angular/core';


interface Date {
  Year: number ;
  Month: number ;
  day: number ;
}



@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})

export class OverviewComponent implements OnInit {
  get_CA_Data(){

    // let url = ;

    //let option = {}


    // this.http.get<any>(url, options)


  }

  CA_date = ['September 2020','August 2020'] ;
  CA_L_Con_List_Created = ['Created 1 commit in 1 resposity','Created 2 commits in 1 resposity'] ;
  CA_L_Con_List_file = ['rex1123tw/AI_WEB_ANGULAR','rex1123tw/AI_WEB_ANGULAR'] ;
  CA_L_Con_List_CommitNumber = ['1 commit','2 commits'] ;
  month_text = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']

  color_test = '1'  //  中間顏色的變化  測試寫在這裡  ngstyle

  Con_daylist_list= [ ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',
                      ' ',' ',' ',' ',' ',' ',' ',]

  Username = [ 'rex1123tw' ] ;
  barList = ['Overview', 'Repositories',
             'Projects', 'Packages'] ;



  dateList = [ '2020', '2019' ] ;
  date_nowHL ;

  constructor() { }

  ngOnInit(): void {
    this.date_nowHL = '0' ;
  }

}
