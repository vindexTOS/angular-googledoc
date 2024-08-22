import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { Store } from '@ngrx/store';
import { SetTimeAction } from '../../store/Calendar/Calendar.actions';
import { CalendarType } from '../../types/calendar-types';
import { GetLocalCalendarData, GetSelecctedDate } from '../../store/Calendar/Calendar.selector';
import { Data } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
@Component({
  selector: 'app-appointment-rows',
  standalone: true,
  template: `
    <div class="time-slots-container" #container>
      <div style="height: 100px; width:100%;" >
        @if( isClick || savedAppointment !== null && savedAppointment.date){
          <div class="parent-container" cdkDrag        cdkDragLockAxis="y">
     
  <div class="draggable" 
       cdkDrag
       cdkDragLockAxis="y"
       (cdkDragStarted)="onDragStarted($event)"
       (cdkDragMoved)="onDragMoved($event)"
       (cdkDragEnded)="onDragEnded($event)">
      
  </div>
  
  <div class="square"  (dblclick)=" openModal()"  [ngStyle]="overLayStyle">
  <div class='time-wrapper'> 
    <p>{{ savedAppointment.title}}</p>
         <p class='toptime'> {{startTime }} -  {{endTime}}</p>
        </div>
    <div class="resizer top" (mousedown)="onMouseDownTop($event)"></div>
  
    <div class="resizer bottom" (mousedown)="onMouseDownBottom($event)"></div>
  </div>

</div>
        }
      </div> 
      @for ( slot of timeSlots; track slot ;let i = $index) {
        <div (mousedown)="onClickRow($event, i)" class="time-slot">
          {{slot}}
        </div>
      }
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
      data: { date: this.selectedCalendar, time: this.startTime, title:this.savedAppointment?.title, description:this.savedAppointment?.description }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed with data:', result);
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
    this.calculateTimeSlots();
  }

  onMouseDownTop(event: MouseEvent) {
    event.stopPropagation();
    const square = this.el.nativeElement.querySelector('.square') as HTMLElement;
    this.startY = event.clientY;
    this.initialHeight = square.offsetHeight;
    this.initialTop = square.offsetTop;
    this.isResizingTop = true;
    event.preventDefault();
  }

  onMouseDownBottom(event: MouseEvent) {
    event.stopPropagation();
    this.isResizingBottom = true;
    event.preventDefault();
  }

  resizeBottom(event: MouseEvent, square: HTMLElement) {
    const newHeight = event.clientY - square.getBoundingClientRect().top;
    if (newHeight > 0) {
      this.renderer.setStyle(square, 'height', `${newHeight}px`);
    }
  }

  resizeTop(event: MouseEvent, square: HTMLElement) {
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

      this.overLayStyle.top = `${offsetY}px`;
      this.overLayStyle.height = '100px';
    } else {
      this.overLayStyle.top = '0px';
      this.overLayStyle.height = '100px';
    }
  }

  private calculateTimeSlots() {
    if (!this.container) return;

    const containerRect = this.container.nativeElement.getBoundingClientRect();
    const square = this.el.nativeElement.querySelector('.square') as HTMLElement;

    const squareTop = square.getBoundingClientRect().top - containerRect.top;
    const squareBottom = squareTop + square.offsetHeight;

    const topSlotIndex = Math.floor((squareTop / containerRect.height) * this.timeSlots.length);
    const bottomSlotIndex = Math.ceil((squareBottom / containerRect.height) * this.timeSlots.length);

    const topTimeSlot = this.timeSlots[topSlotIndex] || 'Out of range';
    const bottomTimeSlot = this.timeSlots[bottomSlotIndex] || 'Out of range';

    this.startTime = topTimeSlot;
    this.endTime = bottomTimeSlot;

    let setTime = {
      setTime: {
        startTime: this.startTime,
        endTime: this.endTime,
      },
    };
    this.store.dispatch(SetTimeAction(setTime));
  }

  trackByIndex(index: number) {
    return index;
  }
}
