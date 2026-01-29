// src/components/calendar/types.ts
export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  dragBgColor: string;
  borderColor: string;
  category: string; // '1':개인, '2':부서, '3':전사
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