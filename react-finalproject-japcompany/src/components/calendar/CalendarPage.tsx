import React, { useEffect, useRef, useState } from 'react';
import Calendar from '@toast-ui/calendar'; 
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import axios from 'axios';

// 🧩 부품들 가져오기
import CalendarSidebar from './CalendarSidebar';
import CalendarHeader from './CalendarHeader';
import EventModal from './EventModal';
import { CalendarCategory, ModalState } from './types';

// =================================================================
// 0. 설정 및 상수
// =================================================================
const API_BASE_URL = "http://localhost/api/calendar";
const CATEGORY_API_URL = "http://localhost/api/calendar/categories";

// 🔥 [추가] 회의실 목록 정의 (나중에 DB에서 가져오도록 바꿀 수도 있음)
const MEETING_ROOMS = [
  "KH ACADEMY 5층 본관", 
  "KH ACADEMY 3층 301호", 
  "KH ACADEMY 3층 302호", 
  "임원 회의실", 
  "화상 회의실"
];

export default function CalendarPage() {
  // 📍 [Ref] DOM 요소 및 캘린더 인스턴스 연결
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarInstance = useRef<Calendar | null>(null);

  // 📍 [Auth] 로그인 정보
  const myEmpNo = localStorage.getItem("loginEmpNo") || "";
  const myAuthLevel = parseInt(localStorage.getItem("authorityLevel") || "1");
  const myDeptCode = localStorage.getItem("loginDeptCode") || "HR01";

  // 📍 [State] 데이터 상태 관리
  const [currentDate, setCurrentDate] = useState<string>('');
  const [calendars, setCalendars] = useState<CalendarCategory[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  
  // 📍 [State] 모달(팝업) 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState<ModalState>({
    id: '', 
    title: '', body: '', start: new Date(), end: new Date(),
    calendarId: '', type: '1', location: '', isAllday: false, isPrivate: false,
  });

  // [추가] 최신 카테고리 목록을 담아둘 Ref 바구니
  const calendarsRef = useRef<CalendarCategory[]>([]);

  useEffect(() => {
    calendarsRef.current = calendars;
  }, [calendars]);

  // =================================================================
  // 1. 초기화 (useEffect)
  // =================================================================
  useEffect(() => {
    if (!containerRef.current) return;

    // (1) 캘린더 인스턴스 생성
    calendarInstance.current = new Calendar(containerRef.current, {
      defaultView: 'month',
      useFormPopup: false, 
      useDetailPopup: false,
      isReadOnly: false,
      usageStatistics: false,
      month: { dayNames: ['일', '월', '화', '수', '목', '금', '토'] },
      week: { dayNames: ['일', '월', '화', '수', '목', '금', '토'], taskView: false },
    });

    // (2) 날짜 빈 곳 드래그 -> 모달 열기
    calendarInstance.current.on('selectDateTime', (info) => {
      const currentCalendars = calendarsRef.current; 

      if (currentCalendars.length === 0) {
        alert("카테고리 목록을 불러오는 중입니다. 잠시만 기다려주세요.");
        calendarInstance.current?.clearGridSelections();
        return;
      }

      // 기본 카테고리 선택 로직 (권한에 맞는 것 중 첫 번째)
      const defaultCal = currentCalendars.find(c => parseInt(c.category) <= myAuthLevel);
      const safeId = defaultCal ? defaultCal.id : currentCalendars[0].id; 
      
      setModalValues({
        id: '', 
        title: '', body: '', location: '',
        start: new Date(info.start), 
        end: new Date(info.end),
        isAllday: info.isAllday || false, 
        isPrivate: false, 
        calendarId: safeId,
        type: defaultCal ? defaultCal.category : '1',
      });
      
      setIsModalOpen(true);
      calendarInstance.current?.clearGridSelections();
    });

    // (3) 일정 드래그로 시간/날짜 변경
    calendarInstance.current.on('beforeUpdateEvent', ({ event, changes }) => {
      const toLocalISOString = (dateInput: any) => {
         const date = new Date(dateInput);
         const offset = date.getTimezoneOffset() * 60000;
         const localDate = new Date(date.getTime() - offset);
         return localDate.toISOString().slice(0, 16).replace('T', ' ') + ':00'; 
      };

      const updates: any = {};
      if (changes.start) updates.calStartDt = toLocalISOString(changes.start);
      if (changes.end) updates.calEndDt = toLocalISOString(changes.end);
      if (changes.title) updates.calTitle = changes.title;
      
      axios.put(`${API_BASE_URL}/${event.id}`, updates).then(() => {
        calendarInstance.current?.updateEvent(event.id, event.calendarId, changes);
      }).catch(err => {
         console.error("업데이트 실패:", err);
         alert("일정 이동 실패! (새로고침 해주세요)");
      });
    });

    // (4) 일정 클릭 -> 모달 열기 (상세보기 및 수정)
    calendarInstance.current.on('clickEvent', ({ event }) => {
      setModalValues({
          id: String(event.id),
          calendarId: String(event.calendarId),
          title: String(event.title),
          body: event.body || '',
          location: event.location || '', // DB에 저장된 장소 불러오기
          start: event.start.toDate(),
          end: event.end.toDate(),
          isAllday: event.isAllday || false,
          isPrivate: event.raw?.openYn === 'N',
          type: '1', // 타입은 나중에 캘린더ID로 매칭됨
      });
      setIsModalOpen(true);
    });

    loadCategories();
    updateHeaderDate();

    return () => {
      calendarInstance.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =================================================================
  // 2. 데이터 로딩
  // =================================================================
  const loadCategories = () => {
    axios.get(CATEGORY_API_URL, {
        params: { empNo: myEmpNo, deptCode: myDeptCode }
    }).then((res) => {
      let mapped = res.data.map((c: any) => ({
        id: String(c.id), 
        name: c.name, 
        category: c.category, // 1, 2, 3, 4(회의실)
        color: '#ffffff', 
        bgColor: c.color, 
        dragBgColor: c.color, 
        borderColor: c.color,
      }));

      setCalendars(mapped);
      setSelectedCalendars(mapped.map((c: CalendarCategory) => c.id));
      
      if (calendarInstance.current) {
        calendarInstance.current.setCalendars(mapped);
      }
      loadEvents();

    }).catch(err => console.error("카테고리 로드 실패:", err));
  };

  const loadEvents = () => {
    axios.get(API_BASE_URL, {
        params: {
            empNo: myEmpNo,
            deptCode: myDeptCode,
            _: new Date().getTime()
        }
    }).then((res) => {
      calendarInstance.current?.clear();
      
      const mappedEvents = res.data.map((event: any) => {
          const categoryColor = event.calColor || '#3b82f6';
          const safeStart = event.calStartDt ? String(event.calStartDt).replace(' ', 'T') : new Date();
          const safeEnd = event.calEndDt ? String(event.calEndDt).replace(' ', 'T') : new Date();
          const isAlldayEvent = (event.alldayYn === 'Y' || event.isAllday === true);

          return {
            id: String(event.calNo || event.id),
            calendarId: String(event.typeId || event.calendarId || '1'),
            title: event.calTitle || event.title || '제목 없음',
            body: event.calContent || event.body || '',
            location: event.calLocation || event.location || '', // 장소 매핑
            start: safeStart, 
            end: safeEnd,
            category: isAlldayEvent ? 'allday' : 'time', 
            isAllday: isAlldayEvent,
            backgroundColor: categoryColor, 
            borderColor: categoryColor,
            dragBgColor: categoryColor,
            color: isAlldayEvent ? '#ffffff' : '#000000',
            isVisible: true,
            raw: { openYn: event.openYn } 
        };
      });

      calendarInstance.current?.createEvents(mappedEvents);
    }).catch(err => console.error("일정 로드 실패:", err));
  };

  // =================================================================
  // 3. 핸들러 (저장, 삭제, UI조작)
  // =================================================================
  const updateHeaderDate = () => {
    if (calendarInstance.current) {
      const d = calendarInstance.current.getDate();
      setCurrentDate(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  };

  const handleNav = (action: 'prev' | 'next' | 'today') => {
    calendarInstance.current?.[action]();
    updateHeaderDate();
  };

  const handleChangeView = (view: 'day' | 'week' | 'month') => {
    calendarInstance.current?.changeView(view);
    updateHeaderDate();
  };

  const handleToggleCalendar = (id: string) => {
    const nextSelected = selectedCalendars.includes(id)
      ? selectedCalendars.filter((cid) => cid !== id)
      : [...selectedCalendars, id];
    
    setSelectedCalendars(nextSelected);
    calendarInstance.current?.setCalendarVisibility(id, nextSelected.includes(id));
  };

  const handleAddCategory = (newCalData: { name: string; color: string; category: string }) => {
    const dataToSend = {
        ...newCalData, 
        ownerEmpNo: myEmpNo, 
        deptCode: myDeptCode 
    };

    axios.post(CATEGORY_API_URL, dataToSend).then((res) => {
        // ... (저장 후 로직 동일)
        loadCategories(); // 편의상 재로딩 호출로 대체 가능
    }).catch(err => alert("카테고리 추가 실패!"));
  };

  const handleColorChange = (id, newColor) => {
      axios.put(`${CATEGORY_API_URL}/${id}`, { color: newColor }).then(() => {
          loadCategories(); // 색상 변경 후 재로딩
      }).catch(err => alert("색상 변경 실패: " + err));
  };

  const handleDeleteCategory = (id) => {
      if(!window.confirm("정말 삭제하시겠습니까?")) return;
      axios.delete(`${CATEGORY_API_URL}/${id}`).then(() => {
          loadCategories();
      }).catch(err => alert("삭제 실패: " + err));
  };

  const handleRenameCategory = (id: string, newName: string) => {
    if (!newName.trim()) return;
    axios.put(`${CATEGORY_API_URL}/${id}`, { name: newName }).then(() => {
        loadCategories();
    }).catch(err => alert("이름 수정 실패: " + err));
  };

  // 🔥 [일정 저장 핸들러] 장소(Location) 포함해서 전송
  const handleSaveEvent = () => {
    if (!modalValues.title.trim()) return alert("제목을 입력하세요.");
    if (!myEmpNo) return alert("로그인 정보가 없습니다.");

    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16).replace('T', ' ') + ':00'; 
    };
    
    const eventData = {
        calTitle: modalValues.title,
        calContent: modalValues.body,
        calStartDt: toLocalISOString(modalValues.start), 
        calEndDt: toLocalISOString(modalValues.end),
        calLocation: modalValues.location, // 🔥 모달에서 선택/입력한 장소
        typeId: modalValues.calendarId, 
        alldayYn: modalValues.isAllday ? 'Y' : 'N',
        openYn: modalValues.isPrivate ? 'N' : 'Y',
        empNo: myEmpNo 
    };

    if (modalValues.id) {
        axios.put(`${API_BASE_URL}/${modalValues.id}`, eventData).then(() => {
            loadEvents();
            setIsModalOpen(false);
            alert("수정되었습니다.");
        }).catch(err => alert("수정 실패!"));
    } else {
        axios.post(API_BASE_URL, eventData).then(() => {
            loadEvents();
            setIsModalOpen(false);
            alert("등록되었습니다.");
        }).catch(err => alert("등록 실패!"));
    }
  };

  const handleDeleteEvent = () => {
      if (!modalValues.id) return;
      axios.delete(`${API_BASE_URL}/${modalValues.id}`, { params: { empNo: myEmpNo } })
      .then(() => {
          loadEvents();
          setIsModalOpen(false); 
          alert("삭제되었습니다.");
      }).catch(err => alert("삭제 실패: " + (err.response?.data || err.message)));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CalendarSidebar
        calendars={calendars}
        selectedCalendars={selectedCalendars}
        onToggle={handleToggleCalendar}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory} 
        onRenameCategory={handleRenameCategory}
        onColorChange={handleColorChange}
        authLevel={myAuthLevel}
      />

      <div className="flex-1 flex flex-col bg-white relative">
        <CalendarHeader
          currentDate={currentDate}
          onNav={handleNav}
          onChangeView={handleChangeView}
        />
        
        <div className="flex-1 p-4">
           <div ref={containerRef} style={{ height: '650px' }} />
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        values={modalValues}
        setValues={setModalValues}
        calendars={calendars}
        authLevel={myAuthLevel}
        meetingRooms={MEETING_ROOMS} // 🔥 [핵심] 회의실 목록을 모달에 전달
      />
    </div>
  );
}