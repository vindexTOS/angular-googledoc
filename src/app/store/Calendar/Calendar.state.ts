import { CalendarDateType, CalendarType, SetTimeType } from "../../types/calendar-types"


// type CreateCalendarType = Partial<CalendarType>;



export type Appointment = { 
    date:CalendarDateType['date']
    startTime:string 
    endTime:string 
    id:number
    position:number
    description:string 
    color:string
    radius: number; 
}
export type initialStateType = { 
    appointments:  Appointment[]
   
    selectedCalendarDate:CalendarDateType['date']
    setTime:SetTimeType 
    position: number
}
export const initialCalendarLocalState: initialStateType = { 
    appointments: [],
    
    selectedCalendarDate:new Date(),

    setTime:{
         startTime:'',
         endTime:""
    },
    position:0,
 
}