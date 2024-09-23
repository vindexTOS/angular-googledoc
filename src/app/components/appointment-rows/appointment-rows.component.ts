import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, model, Renderer2, ViewChild } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { Store } from '@ngrx/store';
import { SetTimeAction } from '../../store/Calendar/Calendar.actions';
import { CalendarType, SetTimeType } from '../../types/calendar-types';
import { GetLocalCalendarData, GetSelecctedDate } from '../../store/Calendar/Calendar.selector';
import { Data } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { SingleTimeComponent } from "../single-time/single-time.component";
@Component({
  selector: 'app-appointment-rows',
  standalone: true,
  template: `
<div class="time-slots-container" #container style="display: flex; flex-direction: column; width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 50px; background-color: rgb(39, 39, 39); position: relative;">
             <app-single-time Yangle="1000"  ></app-single-time>
  <div *ngFor="let slot of timeSlots; let i = index" 
       (mousedown)="onClickRow($event, i)" 
       class="time-slot" 
       style="height: 50px; border-bottom: 1px solid #e0e0e0; padding-left: 10px; display: flex; align-items: center; font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; cursor: pointer;">
    {{slot}}
  </div>
</div>
  `,
  styleUrls: ['./appointment-rows.component.scss'],
  imports: [CommonModule, DragDropModule, CalendarModalComponent, SingleTimeComponent]
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
   savedAppointments:any = []
  private selectedCalendarSubject = new BehaviorSubject<Date | null>(this.selectedCalendar);
  private dataFromLocalStorageSubject = new BehaviorSubject<CalendarType[]>(this.dataFromLocalStorage);

  constructor(private renderer: Renderer2, private el: ElementRef, private dialog: MatDialog, private store: Store) {
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

    const slotHeight = this.container.nativeElement.offsetHeight / this.timeSlots.length;
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
}
