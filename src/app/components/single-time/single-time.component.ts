import { Component, Input, OnInit } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { EditAppointmentModalComponent } from '../../edit-appointment-modal/edit-appointment-modal.component';
import { Store } from '@ngrx/store';
import { GetAppointmentData } from '../../store/Calendar/Calendar.actions';

@Component({
  selector: 'app-single-time',
  standalone: true,
  template: `
  <div class="resizer top" (mousedown)="onMouseDownTop($event)"></div>
  
   
    <div
     
      class="chadchad"
      #drag="cdkDrag"
      cdkDrag
      [cdkDragLockAxis]="'y'"
      (cdkDragStarted)="onDragStart()"
  
      (cdkDragEnded)="onDragEnd($event)"
      (dblclick)="openEditModal()"
      [style.top]="currentY + 'px'"   
       [style.backgroundColor]="color"
      style="position: absolute; left: 0;"
      
   
    >
     <div class="text-wrapper"> <p>{{ title }}</p>
      <p>{{startTime}} - {{endTime}} </p> </div>
 
    </div>

    <div class="resizer bottom" (mousedown)="onMouseDownBottom($event)"></div> 
  `,
  styleUrls: ['./single-time.component.scss'],
  imports: [CdkDrag],
})
export class SingleTimeComponent implements OnInit {

  private isResizingTop = false;
  private isResizingBottom = false;
  private initialHeight: number = 0;
  private startY: number = 0;
  private initialTop: number = 0;


  constructor( private dialog: MatDialog,private store:Store){}
  @Input() Yangle: number = 0; // Initial Y position
  @Input() title: string = '';
  @Input() startTime:string = '';
  @Input() endTime:string ='';
  @Input() color:string = '#8D33FF'
  @Input() id: number = 0
  @Input() description:string = ''
  @Input() updatePosition: (newY: number) => void = () => {};

  currentY: number = 0; 
  dragStartY: number = 0;  

  onMouseDownTop(event: MouseEvent) {
    event.stopPropagation();
 
    this.startY = event.clientY;
    // this.initialHeight = square.offsetHeight;
    // this.initialTop = square.offsetTop;
    this.isResizingTop = true;
    event.preventDefault();
  }

  onMouseDownBottom(event: MouseEvent) {
    event.stopPropagation();
    this.isResizingBottom = true;
    event.preventDefault();
  }


  ngOnInit() {
    this.currentY = this.Yangle; 
  
  }

  onDragStart() {
    this.dragStartY = this.currentY;  
  }



  onDragEnd(event: any) {
    
    this.currentY = this.dragStartY + event.distance.y   
    this.Yangle = this.currentY; 
    this.updatePosition(this.Yangle);  
  }
 
  openEditModal() {
    const dialogRef = this.dialog.open(EditAppointmentModalComponent, {
      data: {
        title: this.title,
        description: this.description,
        startTime: this.startTime,
        endTime: this.endTime,
        position: { Yangle: this.currentY },
        id: this.id,
      },
    });
  
    dialogRef.afterClosed().subscribe((updatedData) => {
      if (updatedData) {
        this.updateAppointment(updatedData);
      }
    });
  }
  updateAppointment(updatedData: any) {
    const savedAppointments = JSON.parse(localStorage.getItem('appointment') || '[]');
    
     const index = savedAppointments.findIndex((appointment: any) => appointment.id === updatedData.id);
    
    if (index !== -1) {
       savedAppointments[index] = {
        ...savedAppointments[index],   
        ...updatedData,              
      };
  
      
      localStorage.setItem('appointment', JSON.stringify(savedAppointments));
      let newAppointments = localStorage.getItem("appointment")
      if(newAppointments)
      this.store.dispatch(GetAppointmentData ({appointments:JSON.parse(newAppointments)}))
      console.log('Updated Appointment:', savedAppointments[index]);
    } else {
      console.error('Appointment not found for ID:', updatedData.id);
    }
  }


}
