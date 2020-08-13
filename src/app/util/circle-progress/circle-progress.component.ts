import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.css']
})
export class CircleProgressComponent implements OnInit {

  @Input()
    set percentage(percentage: number) {
        this.percentage$ = percentage;
    }
  @Input()
    set size(size: string) {
      this.size$ = size;
    }
  @Input()
    set color(color: string) {
      this.color$ = color;
    }
  @Input()
    set backgroundcolor(backgroundcolor: string) {
      this.backgroundcolor$ = backgroundcolor;
    }

    get percentage(): number {return this.percentage$;};
    get size(): string {return this.size$;};
    get color(): string {return this.color$;};
    get backgroundcolor(): string {return this.backgroundcolor$ ;};

    // 綁定到DOM的屬性
    percentage$: number;
    size$: string;
    backgroundcolor$:string;
    color$:string;

    constructor(){
    }

    ngOnInit(){
      this.backgroundcolor$ = this.backgroundcolor$ || 'black'
      this.color$ = this.color$ || 'green'
    }

    ifRightHide(){
      if(this.percentage$ > 50) {
        // set right mask backgroundColor
        return this.color$;
      }
      else{
        return this.backgroundcolor$;
      }
    }

    // 計算左右mask的rotate
    calculateRightRotate(){
      if(this.percentage$ < 50) {
        let Nround = this.percentage$/100;
        return `rotate(${Nround}turn)`
      }
      return `rotate(0turn)`
    }

    calculateLefttRotate(){
      if(this.percentage$ > 50) {
        let Nround = (this.percentage$-50)/100;
        return `rotate(${Nround}turn)`
      }

      return `rotate(0turn)`
    }

}
