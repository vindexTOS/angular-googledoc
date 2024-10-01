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
import { Appointment } from '../../store/Calendar/Calendar.state';
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
        [updatePosition]="updateAppointmentPosition.bind(this, appointment.id)"
         [deleteItem]="deleteItem.bind(this, appointment.id)"
       >
     </app-single-time>
     }
     </div> 
      @for ( slot of timeSlots; track slot ;let i = $index) {
        <div   (click)=" openModal($event)"  class="time-slot">
          {{slot}}  
          
        </div>
      }
    </div>

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
 
  deleteItem(id: number) {
    let info = localStorage.getItem('appointment');
    if (info) {
      let arr = JSON.parse(info).filter((val: Appointment) => val.id !== id);
      localStorage.setItem('appointment', JSON.stringify(arr));
      this.loadStoredPositions(); 
    }
  }

  updateAppointmentPosition(id: number, newY: number, radius: number) {
    this.id = id;
 
    let local = localStorage.getItem("appointment");
    let updatedAppointment = local && JSON.parse(local)
    updatedAppointment = updatedAppointment.map((appointment: { id: number }) => {
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
  let updatedAppointment: { id: number; }[] = [];
  
  if (local) {
    updatedAppointment = JSON.parse(local);

    // Log the correct startTime and endTime for debugging
    console.log('Start:', startTime, 'End:', endTime);

    // Update the specific appointment based on its ID
    updatedAppointment = updatedAppointment.map((appointment: { id: number }) => {
      if (appointment.id === this.id) {
        return {
          ...appointment,
          startTime,
          endTime,
        };
      }
      return appointment;
    });

    // Save the updated appointments to localStorage
    localStorage.setItem('appointment', JSON.stringify(updatedAppointment));

    // Force reactivity or state sync by using setTimeout or similar to wait for the DOM to update
    setTimeout(() => {
      const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
      this.savedAppointments = updatedAppointment.filter((val: any) => val.date === selectedDateString);

      // Log to check if appointments are updated immediately
      console.log('Filtered Appointments:', this.savedAppointments);
    }, 0);  // 0ms delay to ensure it runs in the next event loop
  }
}
loadStoredPositions() {
  let info = localStorage.getItem('appointment');
  if (info) {
    this.selectedCalendar = !this.selectedCalendar ? new Date() : this.selectedCalendar;

    const selectedDateString = this.selectedCalendar.toISOString().split('T')[0];
    this.savedAppointments = JSON.parse(info).filter((val: any) => {
      console.log(val.date, selectedDateString);
      return val.date === selectedDateString; 
    });
    console.log(this.savedAppointments);
  }
}

  ngOnInit() {
    this.loadStoredPositions()
    this.generateTimeSlots();

 
  }
 
 


  private generateTimeSlots(): void {
    this.timeSlots = [];
    
    const totalHours = 24;  
    
    for (let hour = 0; hour < totalHours; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      this.timeSlots.push(timeSlot);
     }
  }
  onClickRow(event: MouseEvent ) {
    let newY = event.pageY  -430
    this.calculateTimeSlots(newY, 44)
  

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
    const totalHours = 24; 
    const pixelIncrement = 44.58; // Each hour is represented by ~44.58px

    // Calculate the time offset in hours based on the newY position
    const timeOffset = (newY - startY) / pixelIncrement; // Time offset in hours
    const clampedTimeOffset = Math.max(0, Math.min(timeOffset, totalHours - 1));

    // Calculate the start hour and minutes
    let startHour = Math.floor(clampedTimeOffset);  
    let startMinutes = Math.round((clampedTimeOffset % 1) * 60); // Convert fractional hour to minutes

    // Correct the hour if rounding caused the minutes to "overflow" into the next hour
    if (startMinutes === 60) {
        startHour += 1;
        startMinutes = 0;
    }

    // Calculate the duration in hours based on the radius
    let durationInHours = radius / pixelIncrement; 

    // Adjust duration based on radius threshold
    if (radius > 232) {
        const excessRadius = radius - 232;

        // Limit additional minutes for the first segment (below 16 hours)
        if (clampedTimeOffset < 16) {
            const additionalMinutes = Math.floor(excessRadius / 44.58) * 10; // 10 minutes for each additional hour
            durationInHours += additionalMinutes / 60; // Convert minutes back to hours
        } 
        // Avoid adding extra time beyond 650 radius
        if (radius > 650) {
            durationInHours -= 0.5; // Reduce duration by half an hour if radius exceeds 650 pixels
        }
    }

    // Calculate the end total hours
    let endTotalHours = clampedTimeOffset + durationInHours;

    // If endTotalHours exceeds 24, adjust it
    if (endTotalHours >= totalHours) {
        endTotalHours = totalHours - 0.001; // Prevents it from being capped at exactly 24 hours
    }

    // Calculate the end hour and minutes
    let endHour = Math.floor(endTotalHours);
    let endMinutes = Math.round((endTotalHours % 1) * 60); // Convert fractional hour to minutes

    // Correct the hour if rounding caused the minutes to "overflow" into the next hour
    if (endMinutes === 60) {
        endHour += 1;
        endMinutes = 0;
    }

    // Ensure the hours do not exceed 23
    if (endHour >= totalHours) {
        endHour = totalHours - 1; // Cap to 23:00
        endMinutes = 59; // Max minutes
    }

    // Format the start and end times
    this.startTime = `${startHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
    this.endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Dispatch the time and position to the store
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