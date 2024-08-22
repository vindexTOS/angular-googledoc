import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal()"></div>
    <div class="modal">
      <h2>Edit Appointment</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Title</label>
          <input 
            type="text" 
            id="title" 
            [(ngModel)]="appointment.title" 
            name="title" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            [(ngModel)]="appointment.description" 
            name="description"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="time">Time</label>
          <input 
            type="time" 
            id="time" 
            [(ngModel)]="appointment.time" 
            name="time" 
            required
          />
        </div>
        
        <div class="modal-actions">
          <button type="button" (click)="closeModal()">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./appointment-modal.component.scss']
})
export class AppointmentModalComponent {
  @Input() appointment = {
    title: '',
    description: '',
    time: ''
  };

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  onSubmit() {
    this.save.emit(this.appointment);
  }

  closeModal() {
    this.close.emit();
  }
}