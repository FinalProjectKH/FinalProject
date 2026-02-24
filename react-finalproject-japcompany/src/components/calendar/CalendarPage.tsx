import React, { useEffect, useRef, useState } from 'react';
import Calendar from '@toast-ui/calendar'; 
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import axios from 'axios';

// 🧩 부품들 가져오기 (경로 본인 프로젝트에 맞게 확인해주세요!)
import CalendarSidebar from './CalendarSidebar';
import CalendarHeader from './CalendarHeader';
import EventModal from './EventModal';
import { CalendarCategory, ModalState } from './types';

// =================================================================
// 0. 설정 및 상수
// =================================================================
const API_BASE_URL = "/api/calendar";
const CATEGORY_API_URL = "/api/calendar/categories";

const MEETING_ROOMS = [
  "KH ACADEMY 5층 본관", 
  "KH ACADEMY 3층 301호", 
  "KH ACADEMY 3층 302호", 
  "임원 회의실", 
  "화상 회의실"
];

// 🔥 [핵심 1] Zustand 등으로 저장된 통짜 JSON에서 내 정보 빼오기 자동화 함수
const getMyInfoFromStorage = () => {
  let myEmpNo = "";
  let myAuthLevel = 1;
  let myDeptCode = "HR01";

  if (typeof window !== "undefined") {
    // 로컬 스토리지를 싹 뒤져서 state.user 객체가 있는 곳을 찾습니다.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const item = localStorage.getItem(key);
          if (item && item.includes('"state":{"user":')) {
            const parsed = JSON.parse(item);
            if (parsed?.state?.user?.empNo) {
              myEmpNo = parsed.state.user.empNo;
              myAuthLevel = parsed.state.user.authorityLevel || 1;
              // 사장님은 부서가 null일 수 있으므로 기본값 설정
              myDeptCode = parsed.state.user.deptCode || "HR01"; 
              break;
            }
          }
        } catch (e) { /* 무시 */ }
      }
    }
    
    // 만약 못 찾았다면 기존 방식으로 시도 (안전장치)
    if (!myEmpNo) {
      myEmpNo = localStorage.getItem("loginEmpNo") || "";
      myAuthLevel = parseInt(localStorage.getItem("authorityLevel") || "1", 10);
      myDeptCode = localStorage.getItem("loginDeptCode") || "HR01";
    }
  }
  
  return { myEmpNo, myAuthLevel, myDeptCode };
};

export default function CalendarPage() {
  // 📍 [Ref] DOM 요소 및 캘린더 인스턴스 연결
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarInstance = useRef<Calendar | null>(null);

  // 📍 [Auth] 로그인 정보 (🔥 위에서 만든 함수로 똑똑하게 가져옴!)
  const { myEmpNo, myAuthLevel, myDeptCode } = getMyInfoFromStorage();

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

  // [Ref] 최신 카테고리 목록 보관용 (이벤트 핸들러 내부 접근용)
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
      
      month: { 
          dayNames: ['일', '월', '화', '수', '목', '금', '토'],
          isAlways6Weeks: true, 
          visibleEventCount: 4, 
      },
      week: { dayNames: ['일', '월', '화', '수', '목', '금', '토'], taskView: false },
    });

    // (2) 날짜 빈 곳 드래그 -> 모달 열기 (새 일정)
    calendarInstance.current.on('selectDateTime', (info) => {
      const currentCalendars = calendarsRef.current; 

      if (currentCalendars.length === 0) {
        alert("카테고리 목록을 불러오는 중입니다. 잠시만 기다려주세요.");
        calendarInstance.current?.clearGridSelections();
        return;
      }

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

    // (3) 일정 드래그로 수정
    calendarInstance.current.on('beforeUpdateEvent', ({ event, changes }) => {
      const toLocalISOString = (dateInput: any) => {
         const date = (dateInput && dateInput.toDate) ? dateInput.toDate() : new Date(dateInput);
         const offset = date.getTimezoneOffset() * 60000;
         const localDate = new Date(date.getTime() - offset);
         return localDate.toISOString().slice(0, 16).replace('T', ' ') + ':00'; 
      };

      const updates: any = {
          empNo: myEmpNo,
          deptCode: myDeptCode 
      };

      if (changes.start) updates.calStartDt = toLocalISOString(changes.start);
      if (changes.end) updates.calEndDt = toLocalISOString(changes.end);
      if (changes.title) updates.calTitle = changes.title;
      
      calendarInstance.current?.updateEvent(event.id, event.calendarId, changes);

      axios.put(`${API_BASE_URL}/${event.id}`, updates)
        .catch(err => {
            console.error("업데이트 실패:", err);
            if (err.response && err.response.status === 403) {
                alert("본인의 일정만 수정할 수 있습니다! (또는 관리자 권한 필요)");
            } else {
                alert("일정 이동 실패!");
            }
            loadEvents(); // 롤백
        });
    });

    // (4) 일정 클릭 -> 모달 열기 (상세보기/수정)
    calendarInstance.current.on('clickEvent', ({ event }) => {
      setModalValues({
          id: String(event.id),
          calendarId: String(event.calendarId),
          title: String(event.title),
          body: event.body || '',
          location: event.location || '', 
          start: event.start.toDate(),
          end: event.end.toDate(),
          isAllday: event.isAllday || false,
          isPrivate: event.raw?.openYn === 'N',
          type: '1', 
      });
      setIsModalOpen(true);
    });

    loadCategories();
    updateHeaderDate();

    return () => {
      calendarInstance.current?.destroy();
      calendarInstance.current = null;
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
        category: c.category, 
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
            location: event.calLocation || event.location || '', 
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
        loadCategories(); 
    }).catch(err => alert("카테고리 추가 실패!"));
  };

  // 🔥 [핵심 2] 색상 변경 시 500 에러 해결 (ownerEmpNo 추가)
  const handleColorChange = (id: any, newColor: any) => {
      axios.put(`${CATEGORY_API_URL}/${id}`, { 
          color: newColor,
          ownerEmpNo: myEmpNo 
      }).then(() => {
          loadCategories(); 
      }).catch(err => alert("색상 변경 실패: " + err));
  };

  const handleDeleteCategory = (id: any) => {
      if(!window.confirm("정말 삭제하시겠습니까?")) return;
      axios.delete(`${CATEGORY_API_URL}/${id}`).then(() => {
          loadCategories();
      }).catch(err => alert("삭제 실패: " + err));
  };

  // 🔥 [핵심 3] 이름 변경 시 500 에러 해결 (ownerEmpNo 추가)
  const handleRenameCategory = (id: string, newName: string) => {
    if (!newName.trim()) return;
    axios.put(`${CATEGORY_API_URL}/${id}`, { 
        name: newName,
        ownerEmpNo: myEmpNo 
    }).then(() => {
        loadCategories();
    }).catch(err => alert("이름 수정 실패: " + err));
  };

  const handleSaveEvent = () => {
    if (!modalValues.title.trim()) return alert("제목을 입력하세요.");
    if (!myEmpNo) return alert("로그인 정보가 없습니다.");

    if (modalValues.type === '3' && myAuthLevel < 3) {
        alert("전사 일정은 관리자만 등록할 수 있습니다.");
        return;
    }

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
        calLocation: modalValues.location, 
        typeId: modalValues.calendarId, 
        alldayYn: modalValues.isAllday ? 'Y' : 'N',
        openYn: modalValues.isPrivate ? 'N' : 'Y',
        empNo: myEmpNo 
    };

    const request = modalValues.id 
        ? axios.put(`${API_BASE_URL}/${modalValues.id}`, eventData)
        : axios.post(API_BASE_URL, eventData);

    request.then(() => {
        loadEvents();
        setIsModalOpen(false);
        alert(modalValues.id ? "수정되었습니다." : "등록되었습니다.");
    }).catch(err => {
        if (err.response && err.response.status === 403) {
            alert(err.response.data || "권한이 없습니다.");
        } else {
            alert("저장 실패!");
        }
    });
  };

  const handleDeleteEvent = () => {
      if (!modalValues.id) return;
      axios.delete(`${API_BASE_URL}/${modalValues.id}`, { params: { empNo: myEmpNo } })
      .then(() => {
          loadEvents();
          setIsModalOpen(false); 
          alert("삭제되었습니다.");
      }).catch(err => {
          if (err.response && err.response.status === 403) {
             alert("삭제 권한이 없습니다.");
          } else {
             alert("삭제 실패: " + (err.response?.data || err.message));
          }
      });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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

      <div className="flex-1 flex flex-col bg-white relative h-full">
        <CalendarHeader
          currentDate={currentDate}
          onNav={handleNav}
          onChangeView={handleChangeView}
        />
        
        <div className="flex-1 p-4 overflow-hidden relative">
           <div ref={containerRef} style={{ height: '100%' }} />
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
        meetingRooms={MEETING_ROOMS} 
      />
    </div>
  );
}