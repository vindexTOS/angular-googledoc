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
import { GetLocalAppointmentData, GetSelecctedDate } from '../../store/Calendar/Calendar.selector';
@Component({
  selector: 'app-appointment-rows',
  standalone: true,
  template: `
      <div class="time-slots-container" #container >
      <div style="height: 100px; width:100%;"  >
 
          <div class="parent-container"  cdkDrag cdkDragLockAxis="y">
          @for(appointment of  savedAppointments;  track appointment    ; let i = $index ){
         <app-single-time 
             [description]="appointment.description"
       [Yangle]="appointment.position"
       [title]="appointment.title"
        [startTime]="appointment.startTime"
        [endTime]="appointment.endTime"
        [color]="appointment.color"
        [id]="appointment.id"
            [radius]="appointment.radius"
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
        <div  (click)=" openModal($event)"  class="time-slot">
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
    this.store.select(GetLocalAppointmentData).subscribe((appointment) => {
 
      const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
      let changedData   = appointment.filter((val: any) => val.date === selectedDateString);
   
      this.savedAppointments = changedData
     });
  
    this.store.select(GetSelecctedDate).subscribe((date) => {
      this.selectedCalendar = date;
      let local = localStorage.getItem("appointment");
      if (local) {
        this.savedAppointments = JSON.parse(local);
        const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
        this.savedAppointments = this.savedAppointments.filter((val: any) => val.date === selectedDateString);
        
      }
   
    });
  
   


    

   

  }

 

  updateAppointmentPosition(id: number, newY: number, radius: number) {
    this.id = id;
 
    let local = localStorage.getItem("appointment");
    let updatedAppointment = local && JSON.parse(local)
    updatedAppointment = updatedAppointment .map((appointment: { id: number }) => {
        if (appointment.id === id) {
            return {
                ...appointment,
                position: newY,
                radius: radius  
            };
        }
        return appointment;
    });

    localStorage.setItem('appointment', JSON.stringify(updatedAppointment ));
    this.calculateTimeSlots(newY, radius);

    
    const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
   
    this.savedAppointments =   updatedAppointment .filter((val: any) => val.date === selectedDateString);

}


updateAppointmentTime(startTime: string, endTime: string) {
  let local = localStorage.getItem("appointment");
let updatedAppointment = local && JSON.parse(local)
 updatedAppointment = updatedAppointment .map((appointment: { id: number }) => {
      if (appointment.id === this.id) {
          return {
              ...appointment,
              startTime,
              endTime
          };
      }
      return appointment;
  });

   localStorage.setItem('appointment', JSON.stringify(updatedAppointment));
  // console.log(updatedAppointment)
   const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
  this.savedAppointments = updatedAppointment.filter((val: any) => val.date === selectedDateString);

  
}


  loadStoredPositions() {
    let info = localStorage.getItem('appointment')
        if(info){
          const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
          this.savedAppointments =  JSON.parse(info).filter((val: any) => val.date === selectedDateString);
      
        }
 
  }

  ngOnInit() {
    this.loadStoredPositions()
    this.generateTimeSlots();

 
  }
 
 


  private generateTimeSlots(): void {
    this.timeSlots = [];
    
    const totalHours = 24; // 0-23 hours
    
    for (let hour = 0; hour < totalHours; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      this.timeSlots.push(timeSlot);
     }
  }
  onClickRow(event: MouseEvent ) {
    let newY = event.pageY  -430
    this.calculateTimeSlots(newY, 50)
  

  }

  openModal(event:any): void {
    this.onClickRow(event)
 
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
          const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
          this.savedAppointments =  JSON.parse(info).filter((val: any) => val.date === selectedDateString);
      
        }

      }
    });
  }

  private calculateTimeSlots(newY: number, radius: number): void {
    const startY = 80;  
    const endY = 1150;  
    const totalHours = 24; 
    const totalSlots = totalHours * 4;  
    const pixelIncrement = (endY - startY) / (totalSlots - 1); 

     const slotIndex = Math.floor((newY - startY) / pixelIncrement);
    const clampedSlotIndex = Math.max(0, Math.min(slotIndex, totalSlots - 1));

     const startHour = Math.floor(clampedSlotIndex / 4) - 1;  
    const startMinutes = (clampedSlotIndex % 4) * 15;  
  
     const durationInSlots = Math.ceil(radius >= 666 ? radius / 11:radius >= 300 ? radius/ 12: radius / 13); 

     const endSlotIndex = clampedSlotIndex + durationInSlots; 
    const endClampedSlotIndex = Math.min(endSlotIndex, totalSlots - 1);
    
    const endHour = Math.floor(endClampedSlotIndex / 4);
    const endMinutes = (endClampedSlotIndex % 4) * 15;

     this.startTime = `${startHour <= 0 ? "0" : startHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
    this.endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

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