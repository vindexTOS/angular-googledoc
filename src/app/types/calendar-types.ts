
export interface CalendarDateType{ 
    date: Date;
    startTime: string 
    endTime: string  
}

export interface CalendarType extends   CalendarDateType {
  title: string;
  description: string;

}


export interface SetTimeType  {

   startTime:string 
   endTime:string
}