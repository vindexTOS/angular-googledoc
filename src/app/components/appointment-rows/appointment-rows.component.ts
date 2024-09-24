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
      <div class="time-slots-container" #container >
      <div style="height: 100px; width:100%;"  >
   
          <div class="parent-container"  cdkDrag cdkDragLockAxis="y">
     
          @for(appointment of  savedAppointments; track appointment; let i = $index ){
         <app-single-time 
       [Yangle]="appointment.position"
       [title]="appointment.title"
        [startTime]="appointment.startTime"
        [endTime]="appointment.endTime"
       
       [updatePosition]="updateAppointmentPosition.bind(this, appointment.id)">
     </app-single-time>
     }
  
  <div class="square"   [ngStyle]="overLayStyle">
  <div class='time-wrapper'  >  
 
       
        </div>
    <!-- <div class="resizer top" (mousedown)="onMouseDownTop($event)"></div>
  
    <div class="resizer bottom" (mousedown)="onMouseDownBottom($event)"></div> -->
  </div>

</div>
     
      </div> 
      @for ( slot of timeSlots; track slot ;let i = $index) {
        <div  (dblclick)=" openModal()"  (mousedown)="onClickRow($event )"  class="time-slot">
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
 
  selectedCalendar: Date = new Date();
  dataFromLocalStorage: CalendarType[] = [];
  startTime = '';
  endTime = '';
 
 

  savedAppointments: any = [
  

  ];

  private selectedCalendarSubject = new BehaviorSubject<Date | null>(
    this.selectedCalendar
  );
  private dataFromLocalStorageSubject = new BehaviorSubject<CalendarType[]>(
    this.dataFromLocalStorage
  );


  constructor(
 
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

    // this.loadStoredPositions();
  }



  updateAppointmentPosition(id: number, newY: number) {
 
    this.savedAppointments = this. savedAppointments.map((appointment: { id: number }) => {
      if (appointment.id === id) {
        return {
          ...appointment,
          position:  newY
        };
      }
      return appointment;
    });
    localStorage.setItem('appointment', JSON.stringify(this. savedAppointments ));
    // After updating the position, calculate the new time slots for this appointment
    this.calculateTimeSlots(newY);
  }


  updateAppointmentTime(id:number,  startTime:string,endTime:string){
    this.savedAppointments = this. savedAppointments.map((appointment: { id: number }) => {
      if (appointment.id === id) {
        return {
          ...appointment,
            startTime,
            endTime 
        };
      }
      return appointment;
    });
    localStorage.setItem('appointment', JSON.stringify(this. savedAppointments ));
  }


  loadStoredPositions() {
   this.savedAppointments = JSON.parse(localStorage.getItem('appointment') || '[]');
 
  }

  ngOnInit() {
    this.loadStoredPositions()
    this.generateTimeSlots();
  }
  ngAfterViewInit() {
    // this.positionSquare();
  }
  // private positionSquare() {
  //   if (!this.container) return;

  //   const startIndex = this.timeSlots.indexOf(this.startTime);
  //   const endIndex = this.timeSlots.indexOf(this.endTime);

  //   const slotHeight =
  //     this.container.nativeElement.offsetHeight / this.timeSlots.length;
  //   const topPosition = startIndex * slotHeight;
  //   const squareHeight = (endIndex - startIndex) * slotHeight;

  //   this.overLayStyle.top = `${topPosition}px`;
  //   this.overLayStyle.height = `${squareHeight}px`;
  // }




  private generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }
  onClickRow(event: MouseEvent ) {
    let newY = event.pageY  -430
    this.calculateTimeSlots(newY)
  

  }

  openModal(): void {
    const dialogRef = this.dialog.open(CalendarModalComponent, {
      width: '1200px',
      data: {setTime:{startTime:this.startTime, endTime:this.endTime }}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed with data:', result);
      }
    });
  }

  private calculateTimeSlots(newY: number) {
    console.log(newY)
    const containerRect = this.container?.nativeElement.getBoundingClientRect();
    const slotHeight = containerRect.height / this.timeSlots.length;


    const topSlotIndex = Math.floor(newY / slotHeight);
    const bottomSlotIndex = Math.ceil((newY) / slotHeight);


    const clampedTopIndex = Math.max(0, Math.min(topSlotIndex, this.timeSlots.length - 1));
    const clampedBottomIndex = Math.max(0, Math.min(bottomSlotIndex, this.timeSlots.length - 1));

    this.startTime = this.timeSlots[clampedTopIndex];
    this.endTime = this.timeSlots[clampedBottomIndex];

    console.log('Updated times:', this.startTime, this.endTime);

    const setTime = {
      setTime: {
        startTime: this.startTime,
        endTime: this.endTime,
      },
    };

    this.store.dispatch(SetTimeAction(setTime));
    this.store.dispatch(SetPosition({position:newY}))
  }

}
