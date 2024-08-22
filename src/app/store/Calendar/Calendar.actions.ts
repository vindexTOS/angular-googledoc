import { createAction, props } from '@ngrx/store';
import { CalendarDateType, CalendarType, SetTimeType } from '../../types/calendar-types';

export const GetCalendarData = createAction(
  '[get calendar data from local storage]',
  props<{ calendarData: CalendarType[] }>()
);


export const SelectCalendarDate = createAction(
  "[select calendar date]" ,
  props<{selectedCalendarDate:CalendarDateType['date']}>()
)


export const SetTimeAction =  createAction(
   "[set time]" , 
    props<{setTime:SetTimeType  }>()
)
 
 

