import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  model,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { Store } from '@ngrx/store';
import { SetPosition, SetTimeAction } from '../../store/Calendar/Calendar.actions';
import { CalendarType, SetTimeType } from '../../types/calendar-types';
 
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { SingleTimeComponent } from '../single-time/single-time.component';
import { AppointmentService } from '../../services/appointment.service';
import { GetLocalAppointmentData } from '../../store/Calendar/Calendar.selector';
@Component({
  selector: 'app-appointment-rows',
  standalone: true,
  template: `
      <div class="time-slots-container" #container >
      <div style="height: 100px; width:100%;"  >
   
          <div class="parent-container"  cdkDrag cdkDragLockAxis="y">
     
          @for(appointment of  savedAppointments; track appointment; let i = $index ){
         <app-single-time 
             [description]="appointment.description"
       [Yangle]="appointment.position"
       [title]="appointment.title"
        [startTime]="appointment.startTime"
        [endTime]="appointment.endTime"
        [color]="appointment.color"
        [id]="appointment.id"
    
       [updatePosition]="updateAppointmentPosition.bind(this, appointment.id)">
     </app-single-time>
     }
  
  <div class="square"   [ngStyle]="overLayStyle">
  <div class='time-wrapper'  >  
 
       
        </div>
  
  </div>

</div>
     
      </div> 
      @for ( slot of timeSlots; track slot ;let i = $index) {
        <div  (click)=" openModal($event)"       class="time-slot">
          {{slot}}
        </div>
      }
    </div>
  `,
  styleUrls: ['./appointment-rows.component.scss'],
  imports: [
    CommonModule,
    DragDropModule,
    CalendarModalComponent,
    SingleTimeComponent,
  ],
})




export class AppointmentRowsComponent {
  timeSlots:  any[] = [];
  @ViewChild('container') container: ElementRef | undefined;
  isClick = false;
  overLayStyle = {
    top: '0px',
    height: '100px',
  };
 
  selectedCalendar: Date = new Date();
  dataFromLocalStorage: CalendarType[] = [];
  startTime = '';
  endTime = '';
   id:number = 0;
 

  savedAppointments: any = [
  

  ];
 


  constructor(
 
    private dialog: MatDialog,
    private store: Store,
    private appointmentService:AppointmentService
  ) {
     

     this.store.select(GetLocalAppointmentData).subscribe((data) => {
      this. savedAppointments = data
    });

   
 
  }

   

  updateAppointmentPosition(id: number, newY: number) {
      this.id = id;
    this.savedAppointments = this. savedAppointments.map((appointment: { id: number }) => {
      if (appointment.id === id) {
        return {
          ...appointment,
          position:  newY
        };
      }
      return appointment;
    });
    localStorage.setItem('appointment', JSON.stringify(this.savedAppointments ));
    // After updating the position, calculate the new time slots for this appointment
    this.calculateTimeSlots(newY);
  }


  updateAppointmentTime(  startTime:string,endTime:string){
    this.savedAppointments = this. savedAppointments.map((appointment: { id: number }) => {
      if (appointment.id === this.id) {
        return {
          ...appointment,
            startTime,
            endTime 
        };
      }
      return appointment;
    });
    localStorage.setItem('appointment', JSON.stringify(this.savedAppointments ));
  }


  loadStoredPositions() {
   this.savedAppointments = JSON.parse(localStorage.getItem('appointment') || '[]');
 
  }

  ngOnInit() {
    this.loadStoredPositions()
    this.generateTimeSlots();
  }
  ngAfterViewInit() {
  
  }
 


  private generateTimeSlots(): void {
    this.timeSlots = [];
    
    const totalHours = 24; // 0-23 hours
    
    for (let hour = 0; hour < totalHours; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      this.timeSlots.push(timeSlot);
      console.log(`Hour ${hour}: ${timeSlot}`);
    }
  }
  onClickRow(event: MouseEvent ) {
    let newY = event.pageY  -430
    this.calculateTimeSlots(newY)
  

  }

  openModal(event:any): void {
    this. onClickRow(event)
 
    let randomNum = Math.floor(Math.random() * 12)
    let hex = this.appointmentService.colors[ randomNum]

    const dialogRef = this.dialog.open(CalendarModalComponent, {
      width: '1200px',
      data: {setTime:{startTime:this.startTime, endTime:this.endTime }, color:hex}
    });
 
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let info = localStorage.getItem('appointment')
        if(info){
          this.savedAppointments = JSON.parse(info)
        }

      }
    });
  }

  private calculateTimeSlots(newY: number): void {
    console.log('newY:', newY);
    
    const startY = 80;  
    const endY = 1150;  
    const totalHours = 24; 
    const totalSlots = totalHours * 4;  
    const pixelIncrement = (endY - startY) / (totalSlots - 1); 
  
 
    const slotIndex = Math.floor((newY - startY) / pixelIncrement);
    const clampedSlotIndex = Math.max(0, Math.min(slotIndex, totalSlots - 1));
    
    const startHour = Math.floor(clampedSlotIndex / 4) - 1  
    const startMinutes = (clampedSlotIndex % 4) * 15  ;  
  
 
    const endHour = Math.floor((clampedSlotIndex + 1) / 4);
    let endMinutes = ((clampedSlotIndex + 1) % 4)  * 15  ;
  
    this.startTime = `${startHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
    this.endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  
    console.log('Updated times:', this.startTime, this.endTime);
  
     const setTimePayload = {
      setTime: {
        startTime: this.startTime,
        endTime: this.endTime,
      },
    };
  
     this.updateAppointmentTime(this.startTime, this.endTime);
    this.store.dispatch(SetTimeAction(setTimePayload));
    this.store.dispatch(SetPosition({ position: newY }));
  }
  
  

}
