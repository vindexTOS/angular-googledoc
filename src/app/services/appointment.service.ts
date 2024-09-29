import { Injectable } from '@angular/core';
import { Appointment } from '../store/Calendar/Calendar.state';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  appointmentData: Appointment[] = [];
  colors = [
    "#C74A27", "#2A7D2B", "#2A4B7C", "#C72A6A",
    "#C7A733", "#2AB5B0", "#5B1F8D", "#C75B27",
    "#C727A1", "#C7A227", "#2AB67C", "#7FAF27"
  ];

  constructor() { }

  
}
