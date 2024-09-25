import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CalendarType, SetTimeType } from '../../types/calendar-types';
import { GetLocalAppointmentData, GetPosition, GetSelecctedDate, GetSetTime } from '../../store/Calendar/Calendar.selector';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDialogModule, FormsModule],
  template: `
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content style="display: flex; flex-direction: column;">
        <mat-form-field appearance="fill">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title">
          @if(form.get('title')?.hasError('required')){
            <mat-error  >Title is required.</mat-error>

          }
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>

        <p>Selected Date: {{ selectedCalendar }}</p>
        <p>Selected Time: {{ setTime.startTime }} - {{ setTime.endTime }}</p>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-button color="primary" type="submit">Submit </button>
      </mat-dialog-actions>
    </form>
    ` 
  ,
  styleUrls: ['./calendar-modal.component.scss']
})
export class CalendarModalComponent {
  form: FormGroup;
  setTime: SetTimeType = { startTime: '', endTime: '' };
  calendarData: CalendarType[] = [];
  selectedCalendar: Date = new Date();
  position: number = 0;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { color: string, date: Date | null; time: string | null; title?: string; description?: string; position: any; id?: number },
    private store: Store
  ) {
    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || ''],
      startTime: [this.setTime.startTime || '', Validators.required],
      endTime: [this.setTime.endTime || '', Validators.required]
    });

    this.store.select(GetSetTime).subscribe((data) => {
      this.setTime = data;
      this.form.patchValue({
        startTime: this.setTime.startTime,
        endTime: this.setTime.endTime
      });
    });

    this.store.select(GetPosition).subscribe((data) => {
      this.position = data;
    });

    this.store.select(GetLocalAppointmentData).subscribe((data) => {
      this.calendarData = data;
    });

    this.store.select(GetSelecctedDate).subscribe((data) => {
      this.selectedCalendar = data;
    });
  }
  onSubmit(): void {
    console.log("Form Value:", this.form.value);
    console.log("Form Validity:", this.form.valid);
  
    if (this.form.valid) {
      const appointmentData = {
        title: this.form.get('title')?.value,
        description: this.form.get('description')?.value,
        date: this.selectedCalendar.toISOString().slice(0, 10),
        startTime: this.form.get('startTime')?.value, // Use value from form
        endTime: this.form.get('endTime')?.value, // Use value from form
        position: this.position,
        color: this.data.color,
        id: this.data.id || Math.floor(Math.random() * 3000)
      };
  
      const existingData = localStorage.getItem('appointment');
      let calendarData = existingData ? JSON.parse(existingData) : [];
  
      if (this.data.id) {
        const index = calendarData.findIndex((appointment: CalendarType) => appointment.id === this.data.id);
        if (index !== -1) {
          calendarData[index] = appointmentData;
        }
      } else {
        calendarData.push(appointmentData);
      }
  
      localStorage.setItem('appointment', JSON.stringify(calendarData));
      this.dialogRef.close(appointmentData);
    } else {
      console.log("Form is invalid. Please check your inputs.");
    }
  }
  

  onCancel(): void {
    this.dialogRef.close();
  }
}
