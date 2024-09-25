import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor() { }

  colors = [
    "#C74A27", // Darker Red-Orange
    "#2A7D2B", // Darker Green
    "#2A4B7C", // Darker Blue
    "#C72A6A", // Darker Pink
    "#C7A733", // Darker Yellow
    "#2AB5B0", // Darker Aqua
    "#5B1F8D", // Darker Purple
    "#C75B27", // Darker Orange
    "#C727A1", // Darker Magenta
    "#C7A227", // Darker Gold
    "#2AB67C", // Darker Light Green
    "#7FAF27"  // Darker Lime Green
  ];
}
