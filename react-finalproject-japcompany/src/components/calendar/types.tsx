// src/components/calendar/types.ts
export interface CalendarCategory {
    id: string;        
    name: string;
    color: string;    
    bgColor?: string;  
    category: string;
}

export interface ModalState {
  title: string;
  body: string;
  start: Date;
  end: Date;
  calendarId: string;
  type: string;
  location: string;
  isAllday: boolean;
  isPrivate: boolean;
}