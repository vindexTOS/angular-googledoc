import { CalendarDateType, CalendarType, SetTimeType } from "../../types/calendar-types"


// type CreateCalendarType = Partial<CalendarType>;

export type initialStateType = { 
    calendarData: CalendarType[],
   
    selectedCalendarDate:CalendarDateType['date']
    setTime:SetTimeType 
    position: number
}

export const initialCalendarLocalState: initialStateType = { 
    calendarData: [],
 
    selectedCalendarDate:new Date(),

    setTime:{
         startTime:'',
         endTime:""
    },
    position:0
 
}