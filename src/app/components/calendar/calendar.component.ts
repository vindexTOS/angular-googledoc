import { Component } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
 import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GetLocalCalendarData } from '../../store/Calendar/Calendar.selector';
import { CalendarType } from '../../types/calendar-types';
import { SelectCalendarDate } from '../../store/Calendar/Calendar.actions';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="calendar-container">
      <mat-calendar [(selected)]="selectedDate" (selectedChange)="onDateSelected($event)"></mat-calendar>

      <mat-form-field appearance="fill">
        <mat-label>Choose a start time</mat-label>
        <input matInput type="time" [(ngModel)]="startTime" />
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Choose a end time</mat-label>
        <input matInput type="time" [(ngModel)]="endTime" />
      </mat-form-field>

      <button mat-raised-button color="primary" (click)="onAdd()">Add</button>
    </div>
  `,
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  selectedDate: Date | null = null;
  startTime: string | null = null;
  endTime: string | null = null;
  calendarData: CalendarType[] = [];

  ngOnInit() {
    this.store.select(GetLocalCalendarData).subscribe((data) => {
      this.calendarData = data;
    });
  }

  constructor(
    public dialog: MatDialog,
    private store: Store,
    private snackBar: MatSnackBar
  ) {}
  onDateSelected(date: Date | null): void {
    if(date ){
      this.store.dispatch(SelectCalendarDate({selectedCalendarDate:date}))
    }
   
  }
  onAdd(): void {
    if (!this.selectedDate || !this.startTime || !this.endTime) {
      this.snackBar.open(
        'Please select a date and time before adding an appointment.',
        'Close',
        {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar'],
        }
      );
      return;
    }


    const dialogRef = this.dialog.open(CalendarModalComponent, {
      width: '400px',
      data: {
        date: this.selectedDate,
        startTime: this.startTime,
        endTime: this.endTime,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newCalendarData = [
          ...this.calendarData,
          {
            date: this.selectedDate,
            startTime: this.startTime,
            endTime: this.endTime,
            ...result,
          },
        ];

        localStorage.setItem('calendar-data', JSON.stringify(newCalendarData));

        console.log('Modal data:', result);
        this.calendarData = newCalendarData;
      }
    });
  }
}
