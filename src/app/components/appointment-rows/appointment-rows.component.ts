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
import { SetTimeAction } from '../../store/Calendar/Calendar.actions';
import { CalendarType, SetTimeType } from '../../types/calendar-types';
import {
  GetLocalCalendarData,
  GetSelecctedDate,
} from '../../store/Calendar/Calendar.selector';
import { Data } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { SingleTimeComponent } from '../single-time/single-time.component';
@Component({
  selector: 'app-appointment-rows',
  standalone: true,
  template: `
      <div class="time-slots-container" #container>
      <div style="height: 100px; width:100%;" >
   
          <div class="parent-container" cdkDrag        cdkDragLockAxis="y">
     
          @for(appointment of fakeData; track appointment; let i = $index ){
       
       <app-single-time 
       [Yangle]="appointment.position.Yangle"
       [title]="appointment.title"
       
       [updatePosition]="updateAppointmentPosition.bind(this, appointment.id)">
     </app-single-time>
     }
  
  <div class="square"    [ngStyle]="overLayStyle">
  <div class='time-wrapper'> 
    <p>{{ savedAppointment?.title ? savedAppointment?.title : "No Title"}}</p>
         <p class='toptime'> {{startTime }} -  {{endTime}}</p>
        </div>
    <!-- <div class="resizer top" (mousedown)="onMouseDownTop($event)"></div>
  
    <div class="resizer bottom" (mousedown)="onMouseDownBottom($event)"></div> -->
  </div>

</div>
     
      </div> 
      @for ( slot of timeSlots; track slot ;let i = $index) {
        <div (mousedown)="onClickRow($event, i)" class="time-slot">
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
  timeSlots: string[] = [];
  @ViewChild('container') container: ElementRef | undefined;
  isClick = false;
  overLayStyle = {
    top: '0px',
    height: '100px',
  };

  private isResizingTop = false;
  private isResizingBottom = false;
  private initialHeight: number = 0;
  private startY: number = 0;
  private initialTop: number = 0;
  selectedCalendar: Date = new Date();
  dataFromLocalStorage: CalendarType[] = [];
  startTime = '';
  endTime = '';
  savedAppointment: any = null;
  savedAppointments: any = [];

  fakeData: any = [
    {
      id: 1,
      position: {
        Yangle: 1000,
      },
      title: 'string',
      date: '12-12-12',
      descirption: 'something',
    },
    {
      id: 2,
      position: {
        Yangle: 800,
      },
      title: 'string',
      date: '12-12-12',
      descirption: 'something',
    },
    {
      id: 3,
      position: {
        Yangle: 600,
      },
      title: 'string',
      date: '12-12-12',
      descirption: 'something',
    },
    {
      id: 4,
      position: {
        Yangle: 500,
      },
      title: 'string',
      date: '12-12-12',
      descirption: 'something',
    },
    {
      id: 5,
      position: {
        Yangle: 200,
      },
      title: 'string',
      date: '12-12-12',
      descirption: 'something',
    },
    {
      id: 6,
      position: {
        Yangle: 1200,
      },
      title: 'string',
      date: '12-12-12',
      descirption: 'something',
    },
  ];

  private selectedCalendarSubject = new BehaviorSubject<Date | null>(
    this.selectedCalendar
  );
  private dataFromLocalStorageSubject = new BehaviorSubject<CalendarType[]>(
    this.dataFromLocalStorage
  );
 

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private dialog: MatDialog,
    private store: Store
  ) {
    //  this.store.select(GetSelecctedDate).subscribe((data) => {
    //   this.selectedCalendarSubject.next(data);
    // });

    //  this.store.select(GetLocalCalendarData).subscribe((data) => {
    //   this.dataFromLocalStorageSubject.next(data);
    // });

    //  combineLatest([this.selectedCalendarSubject, this.dataFromLocalStorageSubject])
    //   .pipe(
    //     map(([selectedCalendar, dataFromLocalStorage]) => {
    //       if (!selectedCalendar) {
    //         return null;
    //       }

    //       const appointment = dataFromLocalStorage.find((val: any) =>
    //         val.date.slice(0, 10) === selectedCalendar.toISOString().slice(0, 10)
    //       );

    //       return appointment || null;
    //     })
    //   )
    //   .subscribe((savedAppointment) => {
    //     this.savedAppointment = savedAppointment;
    //     console.log(savedAppointment)
    //     if (this.savedAppointment) {
    //       this.startTime = this.savedAppointment.startTime;
    //       this.endTime = this.savedAppointment.endTime;
    //       this.positionSquare();
    //     }
    //   });

    this.loadStoredPositions();
  }


  updateAppointmentPosition(id: number, newY: number) {
    console.log('Updated Position:', newY); // Log the new position
    this.fakeData = this.fakeData.map((appointment: { id: number }) => {
      if (appointment.id === id) {
        return {
          ...appointment,
          position: {
            Yangle: newY, // Update Yangle when dragging ends
          },
        };
      }
      return appointment;
    });
  
    // After updating the position, calculate the new time slots for this appointment
    this.calculateTimeSlots(id);
  }


  ngOnInit() {
    const saved = localStorage.getItem('appointments');
    if (saved) {
      this.savedAppointments = JSON.parse(saved);
    }
    this.generateTimeSlots();
  }
  ngAfterViewInit() {
    this.positionSquare();
  }
  private positionSquare() {
    if (!this.container) return;

    const startIndex = this.timeSlots.indexOf(this.startTime);
    const endIndex = this.timeSlots.indexOf(this.endTime);

    const slotHeight =
      this.container.nativeElement.offsetHeight / this.timeSlots.length;
    const topPosition = startIndex * slotHeight;
    const squareHeight = (endIndex - startIndex) * slotHeight;

    this.overLayStyle.top = `${topPosition}px`;
    this.overLayStyle.height = `${squareHeight}px`;
  }

  onClickRow(event: MouseEvent, index: number) {
    this.isClick = !this.isClick;

    if (this.isClick && this.container) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;

      // Example: calculate the Y angle position based on your logic
      const height = rect.height; // Get the height of the container
      const yAnglePosition = (offsetY / height) * 100; // This will give a percentage of the height

      this.overLayStyle.top = `${offsetY - 100}px`;
      this.overLayStyle.height = '100px';

      // Save the calculated Y position to localStorage
      this.savePosition({ index, yAnglePosition });
    } else {
      this.overLayStyle.top = '0px';
      this.overLayStyle.height = '100px';
    }
  }

  savePosition(position: { index: number; yAnglePosition: number }) {
    const positions = JSON.parse(localStorage.getItem('appointments') || '[]');
    positions.push(position);
    localStorage.setItem('appointments', JSON.stringify(positions));
  }

  loadStoredPositions() {
    const positions = JSON.parse(localStorage.getItem('appointments') || '[]');
    console.log('Stored Click Positions:', positions);
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }



  private calculateTimeSlots(appointmentId: number) {
    const containerRect = this.container?.nativeElement.getBoundingClientRect();
    const square = this.el.nativeElement.querySelector('.square') as HTMLElement;
    if (!square || !containerRect) return;
  
    const squareTop = square.getBoundingClientRect().top - containerRect.top;
    const squareBottom = square.getBoundingClientRect().bottom - containerRect.top;
  
    const containerHeight = containerRect.height;
    const slotHeight = containerHeight / this.timeSlots.length;
  
    const topSlotIndex = Math.max(0, Math.min(Math.floor(squareTop / slotHeight), this.timeSlots.length - 1));
    const bottomSlotIndex = Math.max(0, Math.min(Math.ceil(squareBottom / slotHeight), this.timeSlots.length - 1));
  
    // console.log('Container Height:', containerHeight);
    // console.log('Slot Height:', slotHeight);
    // console.log('Top Slot Index:', topSlotIndex);
    // console.log('Bottom Slot Index:', bottomSlotIndex);
  
    const adjustTime = (time: string, hours: number) => {
      const [hour, minute] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hour - hours, minute);
      return date.toTimeString().substr(0, 5);
    };
  
    this.startTime = adjustTime(this.timeSlots[topSlotIndex] || 'Out of range', 2);
    this.endTime = adjustTime(this.timeSlots[bottomSlotIndex] || 'Out of range', 3);
  
    // console.log('Start Time:', this.startTime);
    // console.log('End Time:', this.endTime);
  
    // Find and update the relevant appointment in fakeData
    this.fakeData = this.fakeData.map((appointment: any) => {
      if (appointment.id === appointmentId) {
        return {
          ...appointment,
          startTime: this.startTime,
          endTime: this.endTime
        };
      }
      return appointment;
    });
  
    // Dispatch to store
    const setTime = {
      setTime: {
        startTime: this.startTime,
        endTime: this.endTime,
      },
    };
    this.store.dispatch(SetTimeAction(setTime));
  
    // console.log("Updated Appointment:", this.fakeData.find((app:any) => app.id === appointmentId));
  }
}
