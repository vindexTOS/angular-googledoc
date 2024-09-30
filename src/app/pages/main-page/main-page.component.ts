import { Component } from '@angular/core';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { Store } from '@ngrx/store';
 import { CalendarType } from '../../types/calendar-types';
 import { AppointmentModalComponent } from "../../components/appointment-modal/appointment-modal.component";
import { AppointmentRowsComponent } from '../../components/appointment-rows/appointment-rows.component';
 

@Component({
  selector: 'app-main-page',
  standalone: true,
  
  imports: [
    CalendarComponent,
    AppointmentModalComponent,
    AppointmentRowsComponent,
  ],
  template: `
  <main class="main">
    <app-calendar></app-calendar>
 
  <app-appointment-rows></app-appointment-rows>

  </main>`,
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
 
}
