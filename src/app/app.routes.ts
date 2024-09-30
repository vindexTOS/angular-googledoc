import { Routes } from '@angular/router';



export const routes: Routes = [
  {
    path: 'calendar',
    loadComponent: () =>
      import('./pages/main-page/main-page.component').then(
        (c) => c.MainPageComponent
      ),
  },
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: '**', redirectTo: '/calendar' },
];
