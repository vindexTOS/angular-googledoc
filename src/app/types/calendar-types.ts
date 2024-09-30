
export interface CalendarDateType{ 
    date: Date;
    startTime: string 
    endTime: string  
}

export interface CalendarType extends   CalendarDateType {
  title: string;
  description: string;
  id:number 
}


export interface SetTimeType  {

   startTime:string 
   endTime:string
   position? : SetTimerPosition 
}

export interface SetTimerPosition { 

    top: number ,
    bottom: number,
 
}