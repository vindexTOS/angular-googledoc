import { Component, Input, OnInit } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { MatDialog } from '@angular/material/dialog';

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
      (dblclick)=" openModal()" 
      [style.top]="currentY + 'px'"   
       [style.backgroundColor]="color"
      style="position: absolute; left: 0;"
      
   
    >
     <div class="text-wrapper"> <p>{{ title }}</p>
      <p>{{startTime}} - {{endTime}} </p> </div>
    </div>
  `,
  styleUrls: ['./single-time.component.scss'],
  imports: [CdkDrag],
})
export class SingleTimeComponent implements OnInit {
  constructor( private dialog: MatDialog,){}
  @Input() Yangle: number = 0; // Initial Y position
  @Input() title: string = '';
  @Input() startTime:string = '';
  @Input() endTime:string ='';
  @Input() color:string = '#8D33FF'
  @Input() id: number = 0
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

  openModal(): void {
    const dialogRef = this.dialog.open(CalendarModalComponent, {
      width: '1200px',
      data: { setTime: { startTime: this.startTime, endTime: this.endTime } },
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
       
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
       
        const appointmentIndex = appointments.findIndex((appointment: any) => appointment.id === this.id);
  
        if (appointmentIndex !== -1) {
          // Update the title and description if found
          appointments[appointmentIndex].title = result.title;  
          appointments[appointmentIndex].description = result.description;  
        }
  
     
        localStorage.setItem('appointments', JSON.stringify(appointments));
      }
    });
  }
}
