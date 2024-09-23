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
@Component({
  selector: 'app-appointment-rows',
  standalone: true,
  template: `
<div class="time-slots-container" #container style="display: flex; flex-direction: column; width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 50px; background-color: rgb(39, 39, 39); position: relative;">
  

  <div *ngFor="let slot of timeSlots; let i = index" 
       (mousedown)="onClickRow($event, i)" 
       class="time-slot" 
       style="height: 50px; border-bottom: 1px solid #e0e0e0; padding-left: 10px; display: flex; align-items: center; font-family: Arial, sans-serif; font-size: 14px; color: #ffffff; cursor: pointer;">
    {{slot}}
  </div>
</div>
  `,
  styleUrls: ['./appointment-rows.component.scss'],
  imports: [CommonModule, DragDropModule,CalendarModalComponent]
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
     this.store.select(GetSelecctedDate).subscribe((data) => {
      this.selectedCalendarSubject.next(data);
    });

     this.store.select(GetLocalCalendarData).subscribe((data) => {
      this.dataFromLocalStorageSubject.next(data);
    });

     combineLatest([this.selectedCalendarSubject, this.dataFromLocalStorageSubject])
      .pipe(
        map(([selectedCalendar, dataFromLocalStorage]) => {
          if (!selectedCalendar) {
            return null;
          }
          
          const appointment = dataFromLocalStorage.find((val: any) =>
            val.date.slice(0, 10) === selectedCalendar.toISOString().slice(0, 10)
          );

          return appointment || null;
        })
      )
      .subscribe((savedAppointment) => {
        this.savedAppointment = savedAppointment;
        console.log(savedAppointment)
        if (this.savedAppointment) {
          this.startTime = this.savedAppointment.startTime;
          this.endTime = this.savedAppointment.endTime;
          this.positionSquare();
        }
      });
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
  openModal(): void {
    const dialogRef = this.dialog.open(CalendarModalComponent, {
      width: '1200px',
      data: { 
        date: this.selectedCalendar, 
        time: this.startTime, 
        title: this.savedAppointment?.title, 
        description: this.savedAppointment?.description,
        position: {
          top: this.savedAppointment?.position?.top,
          bottom: this.savedAppointment?.position?.bottom,
        } 
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed with data:', result);
         this.calculateTimeSlots()
      }
    });
  }

  private generateTimeSlots(): void {
 
    this.timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  onDragStarted(event: any) {
     const parentContainer = event.source.element.nativeElement.parentElement;
    this.startY = parentContainer.getBoundingClientRect().top;
    this.initialHeight = parentContainer.offsetHeight;
  }

  onDragMoved(event: any) {
     const parentContainer = event.source.element.nativeElement.parentElement;
    const deltaY = event.pointerPosition.y - this.startY;
    const newHeight = this.initialHeight + deltaY;
    parentContainer.style.height = `${newHeight}px`;
  }

  onDragEnded(event: any) {
    this.startY = 0;
    this.initialHeight = 0;
    this.calculateTimeSlots();
  
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    console.log("4")
    const square = this.el.nativeElement.querySelector('.square');
    if (this.isResizingBottom) {
      this.resizeBottom(event, square);
    } else if (this.isResizingTop) {
      this.resizeTop(event, square);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
     
    this.isResizingTop = false;
    this.isResizingBottom = false;
    // this.calculateTimeSlots();
  }

  onMouseDownTop(event: MouseEvent) {    console.log("4")
    event.stopPropagation();
    const square = this.el.nativeElement.querySelector('.square') as HTMLElement;
    this.startY = event.clientY;
    this.initialHeight = square.offsetHeight;
    this.initialTop = square.offsetTop;
    this.isResizingTop = true;
    event.preventDefault();
  }

  onMouseDownBottom(event: MouseEvent) {    console.log("4")
    event.stopPropagation();
    this.isResizingBottom = true;
    event.preventDefault();
  }

  resizeBottom(event: MouseEvent, square: HTMLElement) {    console.log("4")
    const newHeight = event.clientY - square.getBoundingClientRect().top;
    if (newHeight > 0) {
      this.renderer.setStyle(square, 'height', `${newHeight}px`);
    }
  }

  resizeTop(event: MouseEvent, square: HTMLElement) {    console.log("4")
    const deltaY = this.startY - event.clientY;
    const newHeight = this.initialHeight + deltaY;
    if (newHeight > 0) {
      this.renderer.setStyle(square, 'height', `${newHeight}px`);
      this.renderer.setStyle(square, 'top', `${this.initialTop - deltaY}px`);
    }
  }

  onClickRow(event: MouseEvent, index: number) {   
    this.isClick = !this.isClick;
   
    if (this.isClick && this.container) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
  
      this.overLayStyle.top = `${offsetY - 100}px`;
      this.overLayStyle.height = '100px';

     this.openModal()
    
    } else {
      this.overLayStyle.top = '0px';
      this.overLayStyle.height = '100px';
    }
  }
  private calculateTimeSlots() {    
    if (!this.container || !this.el ) return;
  
    const containerRect = this.container.nativeElement.getBoundingClientRect();
    const square = this.el.nativeElement.querySelector('.square') as HTMLElement;
  
    if (!square) return;
  
    const squareTop = square.getBoundingClientRect().top - containerRect.top;
    const squareBottom = square.getBoundingClientRect().bottom - containerRect.top;
  
    const containerHeight = containerRect.height;
    const slotHeight = containerHeight / this.timeSlots.length;
  
    const topSlotIndex = Math.max(0, Math.min(Math.floor(squareTop / slotHeight), this.timeSlots.length - 1));
    const bottomSlotIndex = Math.max(0, Math.min(Math.ceil(squareBottom / slotHeight), this.timeSlots.length - 1));
  
    const adjustTime = (time: string, hours: number) => {
      const [hour, minute] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hour - hours, minute);
      return date.toTimeString().substr(0, 5);
    };
  
    this.startTime = adjustTime(this.timeSlots[topSlotIndex] || 'Out of range', 2);
    this.endTime = adjustTime(this.timeSlots[bottomSlotIndex] || 'Out of range', 3);
  
    const newAppointment: SetTimeType = {
      
      startTime: this.startTime,
      endTime: this.endTime,
      position: {
        top: squareTop,
        bottom: squareBottom,
      },
    };
  
    const isDuplicate = this.savedAppointments.some(
      (appointment: any) =>
        appointment.startTime === newAppointment.startTime &&
        appointment.endTime === newAppointment.endTime &&
        appointment.position.top === newAppointment.position?.top &&
        appointment.position.bottom === newAppointment.position?.bottom
    );
  
    if (!isDuplicate) {
      this.savedAppointments.push(newAppointment);
  
      // Save to localStorage with positions
      localStorage.setItem('appointments', JSON.stringify(this.savedAppointments));
  
      // Dispatch action with time and position
      this.store.dispatch(SetTimeAction({ setTime: newAppointment }));
  
      console.log('New appointment created:', newAppointment);

      const saved = localStorage.getItem('appointments');
      if (saved) {
        this.savedAppointments = JSON.parse(saved);
      }
    } else {
      console.log('Appointment with the same time and position already exists');
    }
  }
  trackByIndex(index: number) {    console.log("4")
    return index;
  }
}
