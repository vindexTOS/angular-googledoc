import { createFeatureSelector, createSelector } from '@ngrx/store';

export const CalendarLocalStorageSelector = createFeatureSelector<any>(
  'calendarLocalStorage'
);

export const GetLocalAppointmentData = createSelector(
  CalendarLocalStorageSelector,
  (state) => {
    return state.appointments
  }
);

export const GetSelecctedDate = createSelector(
  CalendarLocalStorageSelector,
  (state) => {
    return state.selectedCalendarDate;
  }
);


export const GetSetTime = createSelector(
  CalendarLocalStorageSelector, 
  (state)=>{ 
     return state.setTime
  }
)


export const GetPosition = createSelector(
  CalendarLocalStorageSelector, 
   (state)=>{
     return state.position
   }
)