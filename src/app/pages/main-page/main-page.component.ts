import { Component } from '@angular/core';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { Store } from '@ngrx/store';
import { GetLocalCalendarData } from '../../store/Calendar/Calendar.selector';
import { GetCalendarData } from '../../store/Calendar/Calendar.actions';
import { CalendarType } from '../../types/calendar-types';
 import { AppointmentModalComponent } from "../../components/appointment-modal/appointment-modal.component";
import { AppointmentRowsComponent } from '../../components/appointment-rows/appointment-rows.component';
 

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CalendarComponent,  AppointmentModalComponent, AppointmentRowsComponent, ],
  template: `
  <main class="main">
    <app-calendar></app-calendar>
 
  <app-appointment-rows></app-appointment-rows>

  </main>`,
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  constructor(
    
    private store: Store,
  ) {}
  ngOnInit() {
  

    const calendarDataLocalStorage = localStorage.getItem("calendar-data")
    if(calendarDataLocalStorage != null){
      let calendarArr:CalendarType[] = JSON.parse(calendarDataLocalStorage)
 
     this.store.dispatch(GetCalendarData({calendarData:calendarArr}))
 
    }

  }
}
