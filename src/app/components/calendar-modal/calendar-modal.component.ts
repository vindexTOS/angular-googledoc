import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Add Appointment</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title">
          @if(form.get('title')?.hasError('required')){

         
          <mat-error >
            Title is required.
          </mat-error>    }
        </mat-form-field>
  
        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>

        <p>Selected Date: {{ data.date   }}</p>
        <p>Selected Time: {{ data.time }}</p>
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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: Date | null; time: string | null }

  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}