import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CalendarType, SetTimeType } from '../../types/calendar-types';
import { GetLocalCalendarData, GetSelecctedDate, GetSetTime } from '../../store/Calendar/Calendar.selector';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Add Appointment</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content style="display:flex;flex-direction:column;">
        <mat-form-field appearance="fill">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title">
          @if(form.get('title')?.hasError('required')){
            <mat-error  >
            Title is required.
          </mat-error>
          }
        
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>

        <p>Selected Date: {{ selectedCalendar  }}</p>
        <p>Selected Time: {{ setTime.startTime }} - {{ setTime.endTime }}</p>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-button color="primary" type="submit">Submit</button>
      </mat-dialog-actions>
    </form>
  `,
  styleUrls: ['./calendar-modal.component.scss']
})
export class CalendarModalComponent {
  form: FormGroup;
  setTime: SetTimeType = { startTime: '', endTime: '' };
  calendarData: CalendarType[] = [];
  selectedCalendar: Date = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: Date | null; time: string | null; title?: string; description?: string },
    private store: Store
  ) {
    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || '']
    });

     this.store.select(GetSetTime).subscribe((data) => {
      this.setTime = data;
    });

    this.store.select(GetLocalCalendarData).subscribe((data) => {
      this.calendarData = data;
    });

    this.store.select(GetSelecctedDate).subscribe((data) => {
      this.selectedCalendar = data;
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);

      const existingData = localStorage.getItem('calendar-data');
      let calendarData = existingData ? JSON.parse(existingData) : [];

      const dateToUpdate = this.selectedCalendar.toISOString().slice(0, 10);
      const indexToUpdate = calendarData.findIndex((entry: any) => entry.date.slice(0, 10) === dateToUpdate);

      if (indexToUpdate !== -1) {
        calendarData.splice(indexToUpdate, 1);
      }

      calendarData.push({
        title: this.form.get('title')?.value,
        description: this.form.get('description')?.value,
        date: this.selectedCalendar,
        startTime: this.setTime.startTime,
        endTime: this.setTime.endTime,
      });

      localStorage.setItem('calendar-data', JSON.stringify(calendarData));
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
