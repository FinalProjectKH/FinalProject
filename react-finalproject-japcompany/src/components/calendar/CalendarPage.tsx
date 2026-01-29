import React, { useEffect, useRef, useState } from 'react';
import Calendar from '@toast-ui/calendar'; 
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import axios from 'axios';

// 🧩 부품들 가져오기 (같은 폴더에 위치)
import CalendarSidebar from './CalendarSidebar';
import CalendarHeader from './CalendarHeader';
import EventModal from './EventModal';
import { CalendarCategory, ModalState } from './types';

// =================================================================
// 1. 설정 및 상수
// =================================================================
const MY_AUTH_LEVEL = 2; // 내 권한 (1:사원, 2:팀장, 3:관리자)
const API_BASE_URL = "http://localhost/api/calendar";
const CATEGORY_API_URL = "http://localhost/api/calendar/categories";

export default function CalendarPage() {
  // 📍 [Ref] DOM 요소 및 캘린더 인스턴스 연결
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarInstance = useRef<Calendar | null>(null);

  // 📍 [State] 데이터 상태 관리
  const [currentDate, setCurrentDate] = useState<string>('');
  const [calendars, setCalendars] = useState<CalendarCategory[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  
  // 📍 [State] 모달(팝업) 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState<ModalState>({
    title: '', body: '', start: new Date(), end: new Date(),
    calendarId: '', type: '회의', location: '', isAllday: false, isPrivate: false,
  });

  // =================================================================
  // 2. 초기화 (useEffect)
  // =================================================================
  useEffect(() => {
    if (!containerRef.current) return;

    // (1) 캘린더 인스턴스 생성
    calendarInstance.current = new Calendar(containerRef.current, {
      defaultView: 'month',
      useFormPopup: false, // 기본 팝업 끄기 (커스텀 모달 사용)
      useDetailPopup: false,
      isReadOnly: false,
      usageStatistics: false,
      month: { dayNames: ['일', '월', '화', '수', '목', '금', '토'] },
      week: { dayNames: ['일', '월', '화', '수', '목', '금', '토'], taskView: false },
    });

    // (2) 이벤트 핸들러 등록: 날짜 드래그 -> 모달 열기
    calendarInstance.current.on('selectDateTime', (info) => {
      const defaultCal = calendars.find(c => parseInt(c.category) <= MY_AUTH_LEVEL);
      
      setModalValues(prev => ({
        ...prev, 
        title: '', 
        body: '', 
        start: new Date(info.start), 
        end: new Date(info.end),
        isAllday: info.isAllday || false, 
        isPrivate: false, 
        location: '',
        calendarId: defaultCal ? defaultCal.id : (prev.calendarId || '1')
      }));
      
      setIsModalOpen(true);
      calendarInstance.current?.clearGridSelections(); // 드래그 선택영역 해제
    });

    // (3) 이벤트 핸들러 등록: 일정 드래그 이동/수정
    calendarInstance.current.on('beforeUpdateEvent', ({ event, changes }) => {
      axios.put(`${API_BASE_URL}/${event.id}`, changes).then(() => {
        calendarInstance.current?.updateEvent(event.id, event.calendarId, changes);
      });
    });

    // (4) 이벤트 핸들러 등록: 일정 클릭 (여기선 삭제 예시)
    calendarInstance.current.on('clickEvent', ({ event }) => {
      if(window.confirm(`'${event.title}' 일정을 삭제하시겠습니까?`)) {
         axios.delete(`${API_BASE_URL}/${event.id}`).then(() => {
            calendarInstance.current?.deleteEvent(event.id, event.calendarId);
         });
      }
    });

    // (5) 데이터 로딩 시작
    loadCategories();
    updateHeaderDate();

    // 청소(Cleanup)
    return () => {
      calendarInstance.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 최초 1회만 실행

  // =================================================================
  // 3. 데이터 로딩 로직
  // =================================================================
  const loadCategories = () => {
    axios.get(CATEGORY_API_URL).then((res) => {
      let mapped = res.data.map((c: any) => ({
        id: String(c.typeId), name: c.typeName, color: '#ffffff', bgColor: c.color, dragBgColor: c.color, borderColor: c.color, category: c.calCategory || '1',
      }));

      // [테스트용] 데이터 없으면 더미 데이터 사용
      if (mapped.length === 0) {
        mapped = [
            { id: '1', name: '내 캘린더', color: '#ffffff', bgColor: '#9e5fff', dragBgColor: '#9e5fff', borderColor: '#9e5fff', category: '1' },
            { id: '2', name: '개발팀', color: '#ffffff', bgColor: '#00a9ff', dragBgColor: '#00a9ff', borderColor: '#00a9ff', category: '2' },
        ];
      }

      // 상태 업데이트 & 캘린더 적용
      setCalendars(mapped);
      setSelectedCalendars(mapped.map((c: CalendarCategory) => c.id));
      calendarInstance.current?.setCalendars(mapped);
      
      if (mapped.length > 0) {
        setModalValues(prev => ({ ...prev, calendarId: mapped[0].id }));
      }
      
      // 카테고리 로딩 후 일정 로딩
      loadEvents();

    }).catch(err => {
      console.error("카테고리 로드 실패:", err);
      // 에러 나도 UI가 깨지지 않게 빈 배열 처리 가능
    });
  };

  const loadEvents = () => {
    axios.get(API_BASE_URL).then((res) => {
      calendarInstance.current?.clear();
      calendarInstance.current?.createEvents(res.data);
    }).catch(err => console.error("일정 로드 실패:", err));
  };

  // =================================================================
  // 4. 기능 구현 (Header & Sidebar 연결)
  // =================================================================
  
  // 헤더 날짜 업데이트
  const updateHeaderDate = () => {
    if (calendarInstance.current) {
      const d = calendarInstance.current.getDate();
      setCurrentDate(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  };

  // [Header] 날짜 이동 (이전/다음/오늘)
  const handleNav = (action: 'prev' | 'next' | 'today') => {
    calendarInstance.current?.[action]();
    updateHeaderDate();
  };

  // [Header] 뷰 변경 (월간/주간/일간)
  const handleChangeView = (view: 'day' | 'week' | 'month') => {
    calendarInstance.current?.changeView(view);
    updateHeaderDate();
  };

  // [Sidebar] 캘린더 체크박스 토글
  const handleToggleCalendar = (id: string) => {
    const nextSelected = selectedCalendars.includes(id)
      ? selectedCalendars.filter((cid) => cid !== id)
      : [...selectedCalendars, id];
    
    setSelectedCalendars(nextSelected);
    // 실제 캘린더 화면에서도 숨김/표시 처리
    calendarInstance.current?.setCalendarVisibility(id, nextSelected.includes(id));
  };

  // [Sidebar] 카테고리 추가
  const handleAddCategory = (newCalData: { typeName: string; color: string; calCategory: string }) => {
    axios.post(CATEGORY_API_URL, newCalData).then((res) => {
       // 서버 저장 후 프론트에 반영
       const newCal = {
        id: String(res.data.typeId), name: res.data.typeName, color: '#ffffff',
        bgColor: res.data.color, dragBgColor: res.data.color, borderColor: res.data.color, category: res.data.calCategory
      };
      
      const nextCalendars = [...calendars, newCal];
      setCalendars(nextCalendars); // 사이드바 UI 갱신
      setSelectedCalendars([...selectedCalendars, newCal.id]);
      calendarInstance.current?.setCalendars(nextCalendars); // 캘린더 내부 설정 갱신
    });
  };

  // [Modal] 일정 저장
  const handleSaveEvent = () => {
    if (!modalValues.title.trim()) return alert("제목을 입력하세요.");
    
    axios.post(API_BASE_URL, modalValues).then((res) => {
      // 서버 저장 성공 시 캘린더에 즉시 추가
      calendarInstance.current?.createEvents([res.data]);
      setIsModalOpen(false);
    }).catch(err => alert("저장 실패: " + err));
  };

  // =================================================================
  // 5. 화면 렌더링 (View)
  // =================================================================
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 1. 사이드바 (필터링, 추가) */}
      <CalendarSidebar
        calendars={calendars}
        selectedCalendars={selectedCalendars}
        onToggle={handleToggleCalendar}
        onAddCategory={handleAddCategory}
        onDeleteCategory={(id) => console.log("삭제 구현 필요", id)} // 필요시 구현
        onColorChange={(id, color) => console.log("색상변경 구현 필요", id, color)} // 필요시 구현
        authLevel={MY_AUTH_LEVEL}
      />

      {/* 2. 메인 영역 */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* 헤더 (날짜이동, 뷰전환) */}
        <CalendarHeader
          currentDate={currentDate}
          onNav={handleNav}
          onChangeView={handleChangeView}
        />
        
        {/* Toast UI 캘린더가 그려질 빈 공간 */}
        <div className="flex-1 p-4 overflow-hidden">
           <div ref={containerRef} style={{ height: '100%' }} />
        </div>
      </div>

      {/* 3. 일정 등록/수정 팝업 */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        values={modalValues}
        setValues={setModalValues}
        calendars={calendars}
        authLevel={MY_AUTH_LEVEL}
      />
    </div>
  );
}