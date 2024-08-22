import { Routes } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { MainPageComponent } from './pages/main-page/main-page.component';

export const routes: Routes = [
  { path: 'calendar', component: MainPageComponent},
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: '**', redirectTo: '/calendar' },
];
