 
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
 
 
@Component({
  selector: 'app-edit-appointment-modal',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDialogModule, FormsModule],
  standalone: true,

  template: `
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
  <mat-dialog-content style="display: flex; flex-direction: column;">
    <mat-form-field appearance="fill">
      <mat-label>Title</mat-label>
      <input matInput formControlName="title">
 
     </mat-form-field>

    <mat-form-field appearance="fill">
      <mat-label>Description</mat-label>
      <textarea matInput formControlName="description"></textarea>    </mat-form-field>

    <p>Selected Time: {{ form.get('startTime')?.value }} - {{ form.get('endTime')?.value }}</p>
  </mat-dialog-content>

  <mat-dialog-actions>
    <button mat-button (click)="onCancel()">Cancel</button>
    <button mat-button color="primary" type="submit">Submit</button>
  </mat-dialog-actions>
</form>
`,
  styleUrls: ['./edit-appointment-modal.component.scss'] 

})
export class EditAppointmentModalComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditAppointmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      position: any;
      id: number;
    }
  ) {
    this.form = this.fb.group({
      title: [data.title, Validators.required],
      description: [data.description],
      startTime: [data.startTime, Validators.required],
      endTime: [data.endTime, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.form.value, id: this.data.id });
    } else {
   
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
