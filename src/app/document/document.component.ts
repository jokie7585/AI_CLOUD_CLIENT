import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {

  constructor() { 
    console.log('on DocumentComponent constructor')
   }

  ngOnInit(): void {
    console.log('on DocumentComponent ngOnInit')
  }

}
