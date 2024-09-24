import { Component, Input, OnInit } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-single-time',
  standalone: true,
  template: `
    <div
     
      class="chadchad"
      #drag="cdkDrag"
      cdkDrag
      [cdkDragLockAxis]="'y'"
      (cdkDragStarted)="onDragStart()"
      (cdkDragMoved)="onDragMoved($event)"
      (cdkDragEnded)="onDragEnd($event)"
      [style.top]="currentY + 'px'"   
      style="position: absolute; left: 0;"
    >
      <p>{{ title }}</p>
      <p>{{startTime}} - {{endTime}} </p>
    </div>
  `,
  styleUrls: ['./single-time.component.scss'],
  imports: [CdkDrag],
})
export class SingleTimeComponent implements OnInit {
  @Input() Yangle: number = 0; // Initial Y position
  @Input() title: string = '';
  @Input() startTime:string = '';
  @Input() endTime:string ='';
  @Input() updatePosition: (newY: number) => void = () => {};

  currentY: number = 0; 
  dragStartY: number = 0;  

  ngOnInit() {
    this.currentY = this.Yangle; 
  }

  onDragStart() {
    this.dragStartY = this.currentY;  
  }

  onDragMoved(event: any) {
  
     
  }

  onDragEnd(event: any) {
    
    this.currentY = this.dragStartY + event.distance.y   
    this.Yangle = this.currentY; 
    this.updatePosition(this.Yangle);  
  }

  test(event: any) {
 
  }
}
