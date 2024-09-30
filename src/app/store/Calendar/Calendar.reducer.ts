import { Action, createAction, createReducer, on } from '@ngrx/store';
import { initialCalendarLocalState, initialStateType } from './Calendar.state';
import {
  GetAppointmentData,
  SelectCalendarDate,
  SetPosition,
  SetTimeAction,
} from './Calendar.actions';

const _CalendarLocalStorageReducer = createReducer(
  initialCalendarLocalState,
  on(GetAppointmentData, (state, action) => {
    return { ...state,  appointments: action.appointments };
  }),

  on(SelectCalendarDate, (state, action) => {
    return { ...state, selectedCalendarDate: action.selectedCalendarDate };
  }),
  on(SetTimeAction, (state, action) => {

    return { ...state, setTime: action.setTime }
  }),
  on(SetPosition ,(state,action)=>{ 
      return {...state, position:action.position}

  }                 )
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
