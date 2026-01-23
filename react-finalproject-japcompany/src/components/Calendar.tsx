import React, { useEffect, useRef } from 'react';
import Calendar, { Options } from '@toast-ui/calendar'; // Options 타입 import
import '@toast-ui/calendar/dist/toastui-calendar.min.css';

export default function MyCalendar() {
  // 1. DOM에 접근하기 위한 ref 생성
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // 2. 캘린더 인스턴스를 저장할 ref (나중에 API 호출하거나 메서드 쓸 때 필요)
  const calendarInstance = useRef<Calendar | null>(null);

  useEffect(() => {
    // 화면이 다 그려진 후(mount) 실행됨
    if (calendarRef.current) {
      // 이미 생성되었으면 중복 생성 방지 (React 18 StrictMode 대응 등)
      if (calendarInstance.current) return;

      const options: Options = { // 타입 명시
        defaultView: 'week',
        timezone: {
          zones: [
            { timezoneName: 'Asia/Seoul', displayLabel: 'Seoul' },
            { timezoneName: 'Europe/London', displayLabel: 'London' },
          ],
        },
        calendars: [
          { id: 'cal1', name: '개인', backgroundColor: '#03bd9e' },
          { id: 'cal2', name: '직장', backgroundColor: '#00a9ff' },
        ],
      };

      // 3. ref가 가리키는 div에 캘린더 생성
      calendarInstance.current = new Calendar(calendarRef.current, options);
    }

    // 컴포넌트가 사라질 때(unmount) 캘린더 삭제 (메모리 누수 방지)
    return () => {
      calendarInstance.current?.destroy();
      calendarInstance.current = null;
    };
  }, []);

  return (
    // 4. 여기에 ref 연결 & style 객체 수정
    <div 
      ref={calendarRef} 
      style={{ height: '600px' }} 
    />
  );
}