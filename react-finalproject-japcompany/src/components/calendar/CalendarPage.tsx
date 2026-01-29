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
// 1. 설정 및 상수
// =================================================================
const API_BASE_URL = "http://localhost/api/calendar";
const CATEGORY_API_URL = "http://localhost/api/calendar/categories";

export default function CalendarPage() {
  // 📍 [Ref] DOM 요소 및 캘린더 인스턴스 연결
  const containerRef = useRef(null);
  const calendarInstance = useRef(null);

  // 📍 [Auth] 로그인 정보 가져오기
  const myEmpNo = localStorage.getItem("loginEmpNo") || "";
  const myAuthLevel = parseInt(localStorage.getItem("authorityLevel") || "1");

  // 📍 [State] 데이터 상태 관리
  const [currentDate, setCurrentDate] = useState('');
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  
  // 📍 [State] 모달(팝업) 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState({
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
      useFormPopup: false, 
      useDetailPopup: false,
      isReadOnly: false,
      usageStatistics: false,
      month: { dayNames: ['일', '월', '화', '수', '목', '금', '토'] },
      week: { dayNames: ['일', '월', '화', '수', '목', '금', '토'], taskView: false },
    });

    // (2) 날짜 드래그 -> 모달 열기
    calendarInstance.current.on('selectDateTime', (info) => {
      const defaultCal = calendars.find(c => parseInt(c.category) <= myAuthLevel);
      
      setModalValues(prev => ({
        ...prev, 
        title: '', body: '', 
        start: new Date(info.start), end: new Date(info.end),
        isAllday: info.isAllday || false, isPrivate: false, location: '',
        calendarId: defaultCal ? defaultCal.id : (prev.calendarId || '1')
      }));
      
      setIsModalOpen(true);
      calendarInstance.current?.clearGridSelections();
    });

    // (3) 일정 드래그 이동/수정
    calendarInstance.current.on('beforeUpdateEvent', ({ event, changes }) => {
      // API 호출 (날짜 포맷 주의 필요 - 여기서는 단순 예시)
      axios.put(`${API_BASE_URL}/${event.id}`, changes).then(() => {
        calendarInstance.current?.updateEvent(event.id, event.calendarId, changes);
      });
    });

    // (4) 일정 클릭 (삭제)
    calendarInstance.current.on('clickEvent', ({ event }) => {
      if(window.confirm(`'${event.title}' 일정을 삭제하시겠습니까?`)) {
         axios.delete(`${API_BASE_URL}/${event.id}`).then(() => {
            calendarInstance.current?.deleteEvent(event.id, event.calendarId);
         });
      }
    });

    // (5) 데이터 로딩
    loadCategories();
    updateHeaderDate();

    return () => {
      calendarInstance.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =================================================================
  // 3. 데이터 로딩 로직
  // =================================================================
  const loadCategories = () => {
    axios.get(CATEGORY_API_URL).then((res) => {
      let mapped = res.data.map((c) => ({
        id: String(c.id),       
        name: c.name,           
        category: String(c.category),   
        
        // 🔥 [중요] 카테고리 색상 설정
        color: '#ffffff',       // 글자색
        bgColor: c.color,       // 배경색
        dragBgColor: c.color,   // 드래그색
        borderColor: c.color,   // 테두리색
      }));

      // 데이터 없으면 더미
      if (mapped.length === 0) {
        console.warn("데이터 없음, 더미 사용");
        mapped = [
            { id: '1', name: '내 캘린더', color: '#ffffff', bgColor: '#9e5fff', dragBgColor: '#9e5fff', borderColor: '#9e5fff', category: '1' },
            { id: '2', name: '팀 캘린더', color: '#ffffff', bgColor: '#00a9ff', dragBgColor: '#00a9ff', borderColor: '#00a9ff', category: '2' },
        ];
      }

      setCalendars(mapped);
      setSelectedCalendars(mapped.map(c => c.id));
      
      if (calendarInstance.current) {
        calendarInstance.current.setCalendars(mapped);
      }
      
      if (mapped.length > 0) {
        setModalValues(prev => ({ ...prev, calendarId: mapped[0].id }));
      }
      
      // 카테고리 로드 후 일정 로드
      loadEvents();

    }).catch(err => console.error("카테고리 로드 실패:", err));
  };

  const loadEvents = () => {
    axios.get(API_BASE_URL).then((res) => {
      console.log("서버에서 받은 데이터:", res.data);

      calendarInstance.current?.clear();
      
      const mappedEvents = res.data.map((event) => ({
          id: String(event.calNo || event.id),
          
          // 🔥 [핵심] 이 ID가 카테고리 ID와 일치하면 색상을 자동으로 상속받습니다.
          calendarId: String(event.typeId || event.calendarId || '1'),

          title: event.calTitle || event.title || '제목 없음',
          body: event.calContent || event.body || '',
          location: event.calLocation || event.location || '',

          start: event.calStartDt || event.start, 
          end: event.calEndDt || event.end,

          isAllday: (event.alldayYn === 'Y' || event.isAllday === true),
          category: (event.alldayYn === 'Y' || event.isAllday === true) ? 'allday' : 'time',
          
          isVisible: true,
          
          // ❌ [삭제됨] 여기에 backgroundColor, borderColor를 넣으면 색상 변경이 안 됩니다!
          // 아래 두 줄을 지웠기 때문에 이제 사이드바 색상을 따라갑니다.
          // backgroundColor: ..., 
          // borderColor: ..., 
      }));

      calendarInstance.current?.createEvents(mappedEvents);
    }).catch(err => console.error("일정 로드 실패:", err));
  };

  // =================================================================
  // 4. 핸들러 함수들
  // =================================================================
  const updateHeaderDate = () => {
    if (calendarInstance.current) {
      const d = calendarInstance.current.getDate();
      setCurrentDate(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  };

  const handleNav = (action) => {
    calendarInstance.current?.[action]();
    updateHeaderDate();
  };

  const handleChangeView = (view) => {
    calendarInstance.current?.changeView(view);
    updateHeaderDate();
  };

  const handleToggleCalendar = (id) => {
    const nextSelected = selectedCalendars.includes(id)
      ? selectedCalendars.filter((cid) => cid !== id)
      : [...selectedCalendars, id];
    
    setSelectedCalendars(nextSelected);
    calendarInstance.current?.setCalendarVisibility(id, nextSelected.includes(id));
  };

  const handleAddCategory = (newCalData) => {
    axios.post(CATEGORY_API_URL, newCalData).then((res) => {
       // 저장 후 전체 다시 로드 (간편함)
       loadCategories(); 
    }).catch(err => {
       alert("카테고리 추가 실패: " + err);
    });
  };

  // 🔥 [색상 변경 핸들러] 화면 즉시 반영
  const handleColorChange = (id, newColor) => {
      // 1. 서버 업데이트
      axios.put(`${CATEGORY_API_URL}/${id}`, { color: newColor }).then(() => {
          // 2. React State 업데이트
          const nextCalendars = calendars.map(cal => 
              cal.id === id ? { ...cal, bgColor: newColor, dragBgColor: newColor, borderColor: newColor } : cal
          );
          setCalendars(nextCalendars);
          
          // 3. Toast UI 캘린더 업데이트 (이게 있어야 일정이 옷을 갈아입음)
          if (calendarInstance.current) {
              calendarInstance.current.setCalendars(nextCalendars);
          }
      }).catch(err => alert("색상 변경 실패: " + err));
  };

  const handleDeleteCategory = (id) => {
      if(!window.confirm("정말 삭제하시겠습니까?")) return;
      axios.delete(`${CATEGORY_API_URL}/${id}`).then(() => {
          loadCategories(); // 삭제 후 다시 로드
      }).catch(err => alert("삭제 실패: " + err));
  };

  // 🚨 [저장 함수] 날짜 포맷 해결 버전
  const handleSaveEvent = () => {
    if (!modalValues.title.trim()) return alert("제목을 입력하세요.");
    if (!myEmpNo) return alert("로그인 정보가 없습니다.");

    // T 제거하고 초(:00) 추가하는 포맷터
    const toLocalISOString = (date) => {
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

    console.log("🚀 서버로 전송:", eventData);

    axios.post(API_BASE_URL, eventData).then((res) => {
      loadEvents(); 
      setIsModalOpen(false);
      alert("일정이 등록되었습니다!");
    }).catch(err => {
        console.error("💥 저장 실패:", err);
        alert("저장 실패! 서버 로그를 확인해주세요.");
    });
  };

  // =================================================================
  // 5. 화면 렌더링
  // =================================================================
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 1. 사이드바 */}
      <CalendarSidebar
        calendars={calendars}
        selectedCalendars={selectedCalendars}
        onToggle={handleToggleCalendar}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory} 
        onColorChange={handleColorChange}
        authLevel={myAuthLevel}
      />

      {/* 2. 메인 영역 */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        <CalendarHeader
          currentDate={currentDate}
          onNav={handleNav}
          onChangeView={handleChangeView}
        />
        
        <div className="flex-1 p-4 overflow-hidden">
           <div ref={containerRef} style={{ height: '100%' }} />
        </div>
      </div>

      {/* 3. 모달 */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        values={modalValues}
        setValues={setModalValues}
        calendars={calendars}
        authLevel={myAuthLevel}
      />
    </div>
  );
}