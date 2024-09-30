import { createAction, props } from '@ngrx/store';
import { CalendarDateType, CalendarType, SetTimeType } from '../../types/calendar-types';
import { Appointment } from './Calendar.state';

export const GetAppointmentData = createAction(
  '[get appointment data from local storage]',
  props<{ appointments:Appointment[] }>()
);


export const SelectCalendarDate = createAction(
  "[select calendar date]" ,
  props<{selectedCalendarDate:CalendarDateType['date']}>()
)


export const SetTimeAction =  createAction(
   "[set time]" , 
    props<{setTime:SetTimeType  }>()
)
 
export const SetPosition = createAction(
  "[set position]", 
  props<{position:number}>()
)

