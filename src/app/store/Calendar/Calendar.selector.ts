import { createFeatureSelector, createSelector } from '@ngrx/store';

export const CalendarLocalStorageSelector = createFeatureSelector<any>(
  'calendarLocalStorage'
);

export const GetLocalCalendarData = createSelector(
  CalendarLocalStorageSelector,
  (state) => {
    return state.calendarData;
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
