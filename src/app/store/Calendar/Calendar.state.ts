import { CalendarDateType, CalendarType } from "../../types/calendar-types"


// type CreateCalendarType = Partial<CalendarType>;

export type initialStateType = { 
    calendarData: CalendarType[],
   
    selectedCalendarDate:CalendarDateType['date']
}

export const initialCalendarLocalState: initialStateType = { 
    calendarData: [],
 
    selectedCalendarDate:new Date(),
}