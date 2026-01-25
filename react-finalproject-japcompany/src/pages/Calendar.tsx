import React, { useEffect, useRef, useState } from 'react';
import Calendar, { Options } from '@toast-ui/calendar'; // Options 타입 import
import '@toast-ui/calendar/dist/toastui-calendar.min.css';

// 1. 캘린더 카테고리 데이터 (좌측 사이드바용)
const initialCalendars = [
  { id: '1', name: '출장', color: '#ffffff', bgColor: '#9e5fff', dragBgColor: '#9e5fff', borderColor: '#9e5fff' },
  { id: '2', name: '과제', color: '#ffffff', bgColor: '#00a9ff', dragBgColor: '#00a9ff', borderColor: '#00a9ff' },
  { id: '3', name: '연차신청자(기본)', color: '#ffffff', bgColor: '#ff5583', dragBgColor: '#ff5583', borderColor: '#ff5583' },
  { id: '4', name: '개발', color: '#ffffff', bgColor: '#ffbb3b', dragBgColor: '#ffbb3b', borderColor: '#ffbb3b' },
];

export default function GroupwareCalendar() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstance = useRef<Calendar | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(initialCalendars.map(c => c.id));

  useEffect(() => {
    if (!calendarRef.current) return;

    // 2. 캘린더 인스턴스 생성
    calendarInstance.current = new Calendar(calendarRef.current, {
      defaultView: 'month',
      useFormPopup: true,
      useDetailPopup: true,
      calendars: initialCalendars,
      // Toast UI 기본 헤더를 끄고 우리가 만든 커스텀 헤더를 쓸 것이므로 false 아님 높이조절 필요
      isReadOnly: false, 
    });

    // 초기 날짜 설정 (YYYY.MM 포맷)
    updateCurrentDate(); 

    // 더미 데이터 추가
    calendarInstance.current.createEvents([
      {
        id: 'event1',
        calendarId: '1',
        title: '세종시청 방문 보고',
        start: '2026-01-05T10:00:00',
        end: '2026-01-05T12:00:00',
      },
      {
        id: 'event2',
        calendarId: '3',
        title: '연차(강회계)',
        start: '2026-01-07',
        end: '2026-01-09',
        isAllday: true,
        category: 'allday',
      },
       {
        id: 'event3',
        calendarId: '2',
        title: '신규 TF 회의',
        start: '2026-01-13T14:30:00',
        end: '2026-01-13T15:30:00',
      },
    ]);

    // 캘린더 이동 시 날짜 업데이트 이벤트 리스너
    calendarInstance.current.on('afterRender', () => {
      updateCurrentDate();
    });

    return () => {
      calendarInstance.current?.destroy();
    };
  }, []);

  // 3. 헬퍼 함수들
  const updateCurrentDate = () => {
    if (calendarInstance.current) {
      const date = calendarInstance.current.getDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      setCurrentDate(`${year}.${month}`);
    }
  };

  const handlePrev = () => {
    calendarInstance.current?.prev();
    updateCurrentDate();
  };

  const handleNext = () => {
    calendarInstance.current?.next();
    updateCurrentDate();
  };

  const handleToday = () => {
    calendarInstance.current?.today();
    updateCurrentDate();
  };

  const changeView = (view: 'day' | 'week' | 'month') => {
    calendarInstance.current?.changeView(view);
    updateCurrentDate();
  };

  // 4. 필터링 기능 (체크박스 토글)
  const toggleCalendar = (id: string) => {
    if (!calendarInstance.current) return;

    const nextSelected = selectedCalendars.includes(id)
      ? selectedCalendars.filter((cId) => cId !== id)
      : [...selectedCalendars, id];

    setSelectedCalendars(nextSelected);
    
    // Toast UI API로 캘린더 보이기/숨기기 처리
    calendarInstance.current.setCalendarVisibility(id, nextSelected.includes(id));
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 🟢 왼쪽 사이드바 */}
      <aside className="w-64 border-r border-gray-200 p-5 flex flex-col gap-6">
        <h1 className="text-xl font-bold">캘린더</h1>
        
        <button className="w-full py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium">
          일정등록
        </button>

        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-600">내 캘린더</span>
            <button className="text-gray-400 hover:text-gray-600">✏️</button>
          </div>
          <ul className="space-y-2">
            {initialCalendars.map((cal) => (
              <li key={cal.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCalendars.includes(cal.id)}
                  onChange={() => toggleCalendar(cal.id)}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-0 cursor-pointer"
                  style={{ accentColor: cal.bgColor }} // 체크박스 색상 깔맞춤
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cal.bgColor }}
                ></span>
                <span className="text-sm text-gray-700">{cal.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
           <span className="text-sm font-semibold text-gray-600">관심 캘린더</span>
           <div className="mt-2 space-y-2">
             <button className="w-full text-left text-xs text-gray-500 hover:bg-gray-100 p-2 rounded border">
                + 우리 부서원 모두 추가
             </button>
             <button className="w-full text-left text-xs text-gray-500 hover:bg-gray-100 p-2 rounded border">
                + 관심 캘린더 추가
             </button>
           </div>
        </div>
      </aside>

      {/* 🟢 메인 캘린더 영역 */}
      <main className="flex-1 flex flex-col h-full">
        {/* 커스텀 툴바 */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
             {/* 뷰 변경 버튼들 */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
               <button onClick={() => changeView('day')} className="px-3 py-1 text-sm bg-white hover:bg-gray-50 border-r">일간</button>
               <button onClick={() => changeView('week')} className="px-3 py-1 text-sm bg-white hover:bg-gray-50 border-r">주간</button>
               <button onClick={() => changeView('month')} className="px-3 py-1 text-sm bg-gray-100 font-bold">월간</button>
               <button onClick={() => changeView('month')} className="px-3 py-1 text-sm bg-white hover:bg-gray-50">목록</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-full">
              ◀
            </button>
            <span className="text-2xl font-bold text-gray-800">{currentDate}</span>
            <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-full">
              ▶
            </button>
            <button onClick={handleToday} className="ml-2 px-3 py-1 border rounded text-sm hover:bg-gray-50">
              오늘
            </button>
          </div>
          
          <div className="w-20"></div> {/* 우측 여백용 더미 */}
        </header>

        {/* 캘린더가 그려질 영역 */}
        <div className="flex-1 p-4 overflow-hidden">
          <div ref={calendarRef} className="h-full" />
        </div>
      </main>
    </div>
  );
}