import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { GetLocalCalendarData, GetSelecctedDate } from '../../store/Calendar/Calendar.selector';
import { CalendarType } from '../../types/calendar-types';

export interface Appointment {
  date: Date;
  time: string;
  title: string;
  description?: string;
}

@Component({
  selector: 'app-appointment-scale',
  standalone: true, 
  template: ` <div class="appointment-scale">
  <div class="time-grid">
    @for (slot of timeSlots; track slot) {
      <div class="time-slot">
        <div class="time-label">{{ slot }}</div>
        <div class="appointments">
    
          @for (appointment of getAppointmentsInSlot(slot); track appointment) {
            @if( slot  >= appointment.startTime   &&  slot <= appointment.endTime ){
            <div class="appointment">
              {{ appointment.title }} - {{ appointment.startTime }} -  {{ appointment.endTime }}  hello
              <div 
                class="appointment-bar" 
                [style.width.%]="calculateBarWidth(appointment, slot)">


              </div>
            </div>}
          } @empty {
            <div style="color:white;"></div>
          }
        </div>
      </div>
    } @empty {
      <div>No time slots available</div>
    }
  </div>
</div>`
 
    
  ,
  styleUrls: ['./appointment-scale.component.scss']
})
export class AppointmentScaleComponent implements OnInit, OnDestroy {

  selectedDate$: Observable<Date | null>;
  dataFromLocalStorage: CalendarType[] = [];
 
selectedDate: Date = new Date( );
  timeSlots: string[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private store: Store) {
    this.selectedDate$ = this.store.select(GetSelecctedDate);

   }

  ngOnInit(): void {
    this.store.select(GetLocalCalendarData).subscribe((data) => {
      this.dataFromLocalStorage = data;
    });
    this.subscription.add(
      this.selectedDate$.subscribe(data => {
        this.selectedDate = data as Date;
        console.log(this.selectedDate)
        this.generateTimeSlots();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  
    }
  }

  getAppointmentsInSlot(slot: string): CalendarType[] {
    const slotDecimal = this.timeToDecimal(slot);
    
    return this.dataFromLocalStorage.filter((val: CalendarType) => {
      const startTime = val.startTime;
      const endTime = val.endTime;
  
      // Log the appointment object to debug
      console.log('Checking appointment:', val);
      
      // Handle cases where startTime or endTime are undefined
      if (!startTime || !endTime) {
        console.error('Invalid appointment times:', startTime, endTime);
        return false; // Skip this appointment
      }
      
      const startDecimal = this.timeToDecimal(startTime);
      const endDecimal = this.timeToDecimal(endTime);
    
      const appointmentDate = new Date(val.date);
      appointmentDate.setHours(0, 0, 0, 0);
    
      const selectedDate = new Date(this.selectedDate);
      selectedDate.setHours(0, 0, 0, 0);
    
      return appointmentDate.getTime() === selectedDate.getTime() && (
        (startDecimal <= slotDecimal && endDecimal > slotDecimal) || 
        (startDecimal <= slotDecimal + 1 && endDecimal > slotDecimal)
      );
    });
  }
  calculateBarWidth(appointment: CalendarType, slot: string): number {
    const slotDecimal = this.timeToDecimal(slot);
    const startDecimal = this.timeToDecimal(appointment.startTime);
    const endDecimal = this.timeToDecimal(appointment.endTime);
  
    if (startDecimal >= slotDecimal + 1 || endDecimal <= slotDecimal) {
      return 0; 
    }
  
    const startInSlot = Math.max(startDecimal, slotDecimal);
    const endInSlot = Math.min(endDecimal, slotDecimal + 1);
    
    return (endInSlot - startInSlot) * 100;
  }
  
  private timeToDecimal(timeString: string | undefined): number {
    if (!timeString) {
      // Handle undefined or empty timeString
      console.error('Invalid timeString:', timeString);
      return 0; // Return a default value or handle it as needed
    }
  
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
  }
}
