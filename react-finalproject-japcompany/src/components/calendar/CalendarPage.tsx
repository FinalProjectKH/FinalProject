import React, { useEffect, useRef, useState } from 'react';
import Calendar from '@toast-ui/calendar'; 
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import axios from 'axios';

// 🧩 부품들 가져오기 (경로 확인해주세요!)
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
          
          // 🔥 [핵심 수정 1] 4주짜리 달도 강제로 6줄로 고정! (비율 깨짐 방지)
          isAlways6Weeks: true, 
          
          // 🔥 [핵심 2] 한 칸에 보여줄 최대 개수 (넘치면 'more' 버튼 생김)
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

// (3) 일정 드래그로 수정 (권한 정보 추가 전송)
    calendarInstance.current.on('beforeUpdateEvent', ({ event, changes }) => {
      console.log("🔥 드래그 이동 시도:", event.title);

      const toLocalISOString = (dateInput: any) => {
         const date = (dateInput && dateInput.toDate) ? dateInput.toDate() : new Date(dateInput);
         const offset = date.getTimezoneOffset() * 60000;
         const localDate = new Date(date.getTime() - offset);
         return localDate.toISOString().slice(0, 16).replace('T', ' ') + ':00'; 
      };

      // 🔥 [핵심] 변경된 데이터뿐만 아니라, "누가" 요청했는지도 같이 보냅니다.
      const updates: any = {
          empNo: myEmpNo,      // 로그인한 사람 사번
          deptCode: myDeptCode // 로그인한 사람 부서코드 (혹시 필요할까봐)
      };

      if (changes.start) updates.calStartDt = toLocalISOString(changes.start);
      if (changes.end) updates.calEndDt = toLocalISOString(changes.end);
      if (changes.title) updates.calTitle = changes.title;
      
      // 1. 일단 화면에서는 이동시킴 (사용자 경험을 위해)
      calendarInstance.current?.updateEvent(event.id, event.calendarId, changes);

      // 2. 서버에 요청
      axios.put(`${API_BASE_URL}/${event.id}`, updates)
        .then(() => {
            console.log("✅ DB 업데이트 성공");
        })
        .catch(err => {
            console.error("❌ 업데이트 실패 (403 권한 없음 등):", err);
            
            // 3. 실패 시 경고창 띄우고
            if (err.response && err.response.status === 403) {
                alert("본인의 일정만 수정할 수 있습니다! (또는 관리자 권한 필요)");
            } else {
                alert("일정 이동 실패!");
            }

            // 4. 강제로 원래 위치로 되돌림 (롤백)
            loadEvents(); 
        });
    });

    // (4) 일정 클릭 -> 모달 열기 (상세보기/수정)
    calendarInstance.current.on('clickEvent', ({ event }) => {
      // 팝업 내부의 '편집' 버튼 등을 눌렀을 때도 동작할 수 있음
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
          type: '1', // 나중에 modal 내부 useEffect에서 calendarId로 자동 매칭됨
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

  const handleColorChange = (id: any, newColor: any) => {
      axios.put(`${CATEGORY_API_URL}/${id}`, { color: newColor }).then(() => {
          loadCategories(); 
      }).catch(err => alert("색상 변경 실패: " + err));
  };

  const handleDeleteCategory = (id: any) => {
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

  const handleSaveEvent = () => {
    if (!modalValues.title.trim()) return alert("제목을 입력하세요.");
    if (!myEmpNo) return alert("로그인 정보가 없습니다.");

    // 🔥 [보안] 전사 캘린더 등록 제한 (프론트 1차 방어)
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
        
        {/* 🔥 [핵심 3] 높이 설정: 화면 꽉 차게 (스크롤바 없이 깔끔함) */}
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