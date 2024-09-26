import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { GetAppointmentData } from '../../store/Calendar/Calendar.actions';
import { EditAppointmentModalComponent } from '../../edit-appointment-modal/edit-appointment-modal.component';

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
      (cdkDragEnded)="onDragEnd($event)"
      (dblclick)="openEditModal()"
      [style.top]="currentY + 'px'"
      [style.height]="radius + 'px'" 
      [style.paddingTop]="radius / 10 + 'px'"
      [style.backgroundColor]="color"
      style="position: absolute; left: 0;"
    >
      <div class="text-wrapper">
        <p>{{ title }}</p>
        <p>{{ startTime }} - {{ endTime }}</p>
      </div>

      <div class="resizer top" (mousedown)="onMouseDownTop($event)"></div>
      <div class="resizer bottom" (mousedown)="onMouseDownBottom($event)"></div>
    </div>
  `,
  styleUrls: ['./single-time.component.scss'],
  imports: [CdkDrag],
})
export class SingleTimeComponent implements OnInit {
  private isResizingTop = false;
  private isResizingBottom = false;
  private initialRadius = 0;
  private startY: number = 0;
  private initialTop: number = 0;

  constructor(private dialog: MatDialog, private store: Store) {}

  @Input() Yangle: number = 0; 
  @Input() title: string = '';
  @Input() startTime: string = '';
  @Input() endTime: string = '';
  @Input() color: string = '#8D33FF';
  @Input() id: number = 0;
  @Input() description: string = '';
  @Input() radius: number = 50; 

  @Input() updatePosition: (newY: number, radius: number) => void = () => {};

  currentY: number = 0;
  dragStartY: number = 0;

  onMouseDownTop(event: MouseEvent) {
  

    event.stopPropagation();
    this.startY = event.clientY;
    this.initialTop = this.currentY;
    this.initialRadius = this.radius;  
    this.isResizingTop = true;
    event.preventDefault();
}

onMouseDownBottom(event: MouseEvent) {
    event.stopPropagation();
    this.startY = event.clientY;
    this.isResizingBottom = true;
    this.initialRadius = this.radius;  
    event.preventDefault();
}

@HostListener('document:mousemove', ['$event'])
onMouseMove(event: MouseEvent) {
    const deltaY = event.clientY - this.startY;
    
    if (this.isResizingTop) {
        this.radius = Math.max(10, this.initialRadius - deltaY  );   
        this.currentY = this.initialTop + deltaY; 
        this.updateLocalStorage();
    }

    if (this.isResizingBottom) {
        this.radius = Math.max(10, this.initialRadius + deltaY  );  
        this.updateLocalStorage();
    }
}
 
@HostListener('document:mouseup', ['$event'])
onMouseUp(event: MouseEvent) {
    if (this.isResizingTop || this.isResizingBottom) {
        this.isResizingTop = false;
        this.isResizingBottom = false;
    }
    
}

ngOnInit() {
    this.currentY = this.Yangle;
    this.radius = this.radius || 50;  
}

onDragStart() {

 
    this.dragStartY = this.currentY;
}

onDragEnd(event: any) {
  // this.currentY = this.dragStartY + event.distance.y;
  console.log('radius', this.radius )
  // this.Yangle = this.currentY;
  let innerState  = this.dragStartY + event.distance.y;
  this.updatePosition(innerState ,this.radius);
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
            radius: this.radius, // Save the updated radius
        };

        localStorage.setItem('appointment', JSON.stringify(savedAppointments));
        let newAppointments = localStorage.getItem('appointment');
        if (newAppointments) {
            this.store.dispatch(GetAppointmentData({ appointments: JSON.parse(newAppointments) }));
        }
      
    } else {
        console.error('Appointment not found for ID:', updatedData.id);
    }
}

private updateLocalStorage() {
    const savedAppointments = JSON.parse(localStorage.getItem('appointment') || '[]');
    const index = savedAppointments.findIndex((appointment: any) => appointment.id === this.id);

    if (index !== -1) {
        savedAppointments[index].radius = this.radius; // Update the radius
        localStorage.setItem('appointment', JSON.stringify(savedAppointments));
        this.store.dispatch(GetAppointmentData({ appointments: savedAppointments }));
    
    } else {
        console.error('Appointment not found for ID:', this.id);
    }
}
}
