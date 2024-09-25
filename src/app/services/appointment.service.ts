import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor() { }

  colors = [
    "#FF5733", // Red-Orange
    "#33FF57", // Green
    "#3357FF", // Blue
    "#FF33A6", // Pink
    "#FFEB33", // Yellow
    "#33FFF5", // Aqua
    "#8D33FF", // Purple
    "#FF8333", // Orange
    "#FF33D1", // Magenta
    "#FFDA33", // Gold
    "#33FF8D", // Light Green
    "#B3FF33"  // Lime Green
  ];
}
