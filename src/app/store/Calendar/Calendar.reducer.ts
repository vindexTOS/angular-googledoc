import { Action, createAction, createReducer, on } from '@ngrx/store';
import { initialCalendarLocalState, initialStateType } from './Calendar.state';
import {
    GetCalendarData,
  SelectCalendarDate,
} from './Calendar.actions';

const _CalendarLocalStorageReducer = createReducer(
  initialCalendarLocalState,
  on(GetCalendarData, (state, action) => {
    return { ...state, calendarData: action.calendarData };
  }),

  on(SelectCalendarDate, (state, action) => {
    return { ...state, selectedCalendarDate: action.selectedCalendarDate };
  })
);
export function CalendarLocalStorageReducer(
  state: initialStateType | undefined,
  action: Action
): initialStateType {
  return _CalendarLocalStorageReducer(
    state || initialCalendarLocalState,
    action
  );
}
