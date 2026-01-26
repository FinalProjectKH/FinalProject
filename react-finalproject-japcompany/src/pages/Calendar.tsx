import React, { useEffect, useRef, useState } from 'react';
import Calendar from '@toast-ui/calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import axios from 'axios';

// =================================================================
// 1. 권한 및 타입 설정
// =================================================================

// 🚨 [테스트용] 현재 로그인한 사람의 권한 레벨 (1:사원, 2:팀장, 3:관리자)
// 실제로는 로그인 세션(Recoil, Redux, ContextAPI 등)에서 가져와야 합니다.
const MY_AUTH_LEVEL = 2; 

interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  dragBgColor: string;
  borderColor: string;
  category: string; // '1':개인, '2':부서, '3':전사
}

interface ModalState {
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

const EVENT_TYPES = [
  { code: 'MEETING', name: '회의' },
  { code: 'TASK', name: '업무' },
  { code: 'OUTSIDE', name: '외근' },
  { code: 'VACATION', name: '휴가' },
  { code: 'EVENT', name: '행사' },
];

export default function GroupwareCalendar() {
  // ... (Ref 및 기본 State는 동일) ...
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstance = useRef<Calendar | null>(null);
  
  const [currentDate, setCurrentDate] = useState<string>('');
  const [calendars, setCalendars] = useState<CalendarCategory[]>([]); 
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  
  // 🟢 [수정] 어떤 섹션에서 추가 중인지 ('1'|'2'|'3' | null)
  const [addingSection, setAddingSection] = useState<string | null>(null);
  
  const [newCalendar, setNewCalendar] = useState({ name: '', color: '#3b82f6' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState<ModalState>({
    title: '', body: '', start: new Date(), end: new Date(),
    calendarId: '', type: 'MEETING', location: '', isAllday: false, isPrivate: false,
  });

  const API_BASE_URL = "http://localhost:8080/api/calendar"; 
  const CATEGORY_API_URL = "http://localhost:8080/api/calendar/categories";

  // ... (useEffect 초기화 로직은 기존과 100% 동일하므로 생략 가능, 전체 코드 필요시 그대로 유지) ...
  useEffect(() => {
    if (!calendarRef.current) return;
    calendarInstance.current = new Calendar(calendarRef.current, {
      defaultView: 'month', useFormPopup: false, useDetailPopup: false, isReadOnly: false, usageStatistics: false,
      month: { dayNames: ['일', '월', '화', '수', '목', '금', '토'] },
      week: { dayNames: ['일', '월', '화', '수', '목', '금', '토'], taskView: false },
    });

    axios.get(CATEGORY_API_URL).then((res) => {
      const mappedCalendars = res.data.map((c: any) => ({
        id: String(c.typeId), name: c.typeName, color: '#ffffff', bgColor: c.color, dragBgColor: c.color, borderColor: c.color,
        category: c.calCategory || '1',
      }));
      setCalendars(mappedCalendars);
      setSelectedCalendars(mappedCalendars.map((c: any) => c.id));
      calendarInstance.current?.setCalendars(mappedCalendars);
      if (mappedCalendars.length > 0) setModalValues(prev => ({ ...prev, calendarId: mappedCalendars[0].id }));
    });

    axios.get(API_BASE_URL).then((res) => calendarInstance.current?.createEvents(res.data));

    calendarInstance.current.on('selectDateTime', (info) => {
      setModalValues(prev => ({ ...prev, title: '', body: '', start: new Date(info.start), end: new Date(info.end), isAllday: false, isPrivate: false, location: '' }));
      setIsModalOpen(true);
      calendarInstance.current?.clearGridSelections();
    });

    calendarInstance.current.on('beforeUpdateEvent', ({ event, changes }) => {
      axios.put(`${API_BASE_URL}/${event.id}`, changes).then(() => calendarInstance.current?.updateEvent(event.id, event.calendarId, changes));
    });

    calendarInstance.current.on('clickEvent', ({ event }) => {
       if(window.confirm(`'${event.title}' 일정을 삭제하시겠습니까?`)) {
          axios.delete(`${API_BASE_URL}/${event.id}`).then(() => calendarInstance.current?.deleteEvent(event.id, event.calendarId));
       }
    });

    updateHeaderDate();
    return () => calendarInstance.current?.destroy();
  }, []);

  // =================================================================
  // 핸들러
  // =================================================================
  
  //  캘린더 추가 핸들러 (섹션별로 다르게 호출됨)
  const handleAddCalendar = () => {
    if (!newCalendar.name.trim()) return alert("이름을 입력하세요");
    if (!addingSection) return;

    axios.post(CATEGORY_API_URL, { 
      typeName: newCalendar.name, 
      color: newCalendar.color,
      calCategory: addingSection // 현재 열린 섹션 번호 (1, 2, 3) 자동 적용
    }).then((res) => {
      const newCal = {
        id: String(res.data.typeId),
        name: res.data.typeName,
        color: '#ffffff',
        bgColor: res.data.color,
        dragBgColor: res.data.color,
        borderColor: res.data.color,
        category: res.data.calCategory
      };
      setCalendars([...calendars, newCal]);
      setSelectedCalendars([...selectedCalendars, newCal.id]);
      calendarInstance.current?.setCalendars([...calendars, newCal]);
      
      setNewCalendar({ name: '', color: '#3b82f6' });
      setAddingSection(null); // 입력창 닫기
    });
  };

  const handleSaveEvent = () => { /* 기존과 동일 */ 
     if (!modalValues.title.trim()) return alert("제목을 입력하세요.");
     axios.post(API_BASE_URL, modalValues).then((res) => {
        calendarInstance.current?.createEvents([res.data]); setIsModalOpen(false);
     });
  };
  
  // ... (날짜 변경, 헬퍼 함수들 기존과 동일) ...
  const handleDateChange = (type: any, field: any, value: any) => { /* 생략(기존코드 사용) */ 
    const current = type === 'start' ? modalValues.start : modalValues.end;
    const newDate = new Date(current);
    if (field === 'date') { const [y, m, d] = value.split('-').map(Number); newDate.setFullYear(y, m - 1, d); } 
    else { const [h, min] = value.split(':').map(Number); newDate.setHours(h, min); }
    setModalValues({ ...modalValues, [type]: newDate });
  };
  const handleAlldayChange = (checked: boolean) => { /* 생략(기존코드 사용) */ 
    setModalValues(prev => {
        const s = new Date(prev.start); const e = new Date(prev.end);
        if (checked) { s.setHours(0, 0, 0, 0); e.setHours(23, 59, 59, 999); }
        return { ...prev, isAllday: checked, start: s, end: e };
    });
  };
  const toggleCalendar = (id: string) => { /* 생략(기존코드 사용) */ 
    const nextSelected = selectedCalendars.includes(id) ? selectedCalendars.filter((cid) => cid !== id) : [...selectedCalendars, id];
    setSelectedCalendars(nextSelected);
    if (calendarInstance.current) { calendars.forEach(cal => calendarInstance.current!.setCalendarVisibility(cal.id, nextSelected.includes(cal.id))); }
  };
  const formatDate = (d: Date) => { const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };
  const formatTime = (d: Date) => { const h=String(d.getHours()).padStart(2,'0'); const m=String(d.getMinutes()).padStart(2,'0'); return `${h}:${m}`; };
  const updateHeaderDate = () => { if(calendarInstance.current) { const d=calendarInstance.current.getDate(); setCurrentDate(`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}`); }};
  const nav = (action: any) => { calendarInstance.current?.[action](); updateHeaderDate(); };
  const changeView = (view: any) => { calendarInstance.current?.changeView(view); updateHeaderDate(); };

  // 🟢 [헬퍼] 캘린더 리스트 아이템 컴포넌트
  const CalendarItem = ({ cal }: { cal: CalendarCategory }) => (
    <li className="flex items-center justify-between group cursor-pointer px-1 py-1 hover:bg-gray-50 rounded" onClick={() => toggleCalendar(cal.id)}>
      <div className="flex items-center gap-2.5">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCalendars.includes(cal.id) ? 'bg-gray-700 border-gray-700' : 'border-gray-300'}`}>
              {selectedCalendars.includes(cal.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
          </div>
          <span className="text-sm text-gray-600">{cal.name}</span>
      </div>
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cal.bgColor }}></span>
    </li>
  );

  // 🟢 [헬퍼] 추가 입력 폼 컴포넌트 (각 섹션 하단에 표시)
  const AddForm = () => (
    <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200 flex flex-col gap-2 animate-fade-in-down">
      <div className="flex gap-2 items-center">
        <input type="color" className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer rounded-full overflow-hidden shrink-0"
          value={newCalendar.color} onChange={(e) => setNewCalendar({...newCalendar, color: e.target.value})} />
        <input type="text" className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
          placeholder="캘린더 이름" value={newCalendar.name} onChange={(e) => setNewCalendar({...newCalendar, name: e.target.value})} autoFocus />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setAddingSection(null)} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded">취소</button>
        <button onClick={handleAddCalendar} className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded font-bold">저장</button>
      </div>
    </div>
  );

  // =================================================================
  // 6. JSX 렌더링
  // =================================================================
  return (
    <div className="flex h-screen bg-white relative">
      
      <aside className="w-64 border-r border-gray-200 p-5 flex flex-col bg-white overflow-y-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-6">캘린더</h1>

        {/* 🟢 1. 메인 일정 등록 버튼 (최상단 고정) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 mb-6 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          일정 등록
        </button>

        {/* ---------------------------------------------------------------- */}
        {/* 🟢 2. 내 캘린더 (Category 1) - 누구나 추가 가능 */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">내 캘린더</span>
          </div>
          <ul className="space-y-1">
            {calendars.filter(c => c.category === '1').map(cal => <CalendarItem key={cal.id} cal={cal} />)}
          </ul>
          
          {/* 내 캘린더 추가 버튼/폼 */}
          {addingSection === '1' ? <AddForm /> : (
            <button onClick={() => { setAddingSection('1'); setNewCalendar({name:'', color:'#3b82f6'}); }}
              className="mt-1 w-full text-left px-1 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded flex items-center gap-1 transition-colors">
              + 내 캘린더 추가
            </button>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 🟢 3. 부서 캘린더 (Category 2) - 권한 레벨 2 이상 */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">부서 캘린더</span>
          </div>
          <ul className="space-y-1">
            {calendars.filter(c => c.category === '2').map(cal => <CalendarItem key={cal.id} cal={cal} />)}
          </ul>

          {/* 권한 체크: Level 2 이상일 때만 버튼 표시 */}
          {MY_AUTH_LEVEL >= 2 && (
             addingSection === '2' ? <AddForm /> : (
              <button onClick={() => { setAddingSection('2'); setNewCalendar({name:'', color:'#22c55e'}); }}
                className="mt-1 w-full text-left px-1 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded flex items-center gap-1 transition-colors">
                + 부서 캘린더 추가
              </button>
             )
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 🟢 4. 전사 캘린더 (Category 3) - 권한 레벨 3 */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">전사 캘린더</span>
          </div>
          <ul className="space-y-1">
            {calendars.filter(c => c.category === '3').map(cal => <CalendarItem key={cal.id} cal={cal} />)}
          </ul>

          {/* 권한 체크: Level 3일 때만 버튼 표시 */}
          {[3].includes(MY_AUTH_LEVEL) && (
             addingSection === '3' ? <AddForm /> : (
              <button onClick={() => { setAddingSection('3'); setNewCalendar({name:'', color:'#ef4444'}); }}
                className="mt-1 w-full text-left px-1 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded flex items-center gap-1 transition-colors">
                + 전사 캘린더 추가
              </button>
             )
          )}
        </div>

      </aside>

      {/* 메인 캘린더 영역 (기존과 동일) */}
      <main className="flex-1 flex flex-col h-full">
        {/* 헤더 & 캘린더 렌더링 ... */}
         <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
             <div className="flex border border-gray-300 rounded-md overflow-hidden">
               {['day', 'week', 'month'].map(v => (
                 <button key={v} onClick={() => changeView(v)} className="px-3 py-1 text-sm bg-white hover:bg-gray-50 border-r last:border-r-0 capitalize">
                    {v === 'day' ? '일간' : v === 'week' ? '주간' : '월간'}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => nav('prev')} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">◀</button>
            <span className="text-2xl font-bold text-gray-800">{currentDate}</span>
            <button onClick={() => nav('next')} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">▶</button>
            <button onClick={() => nav('today')} className="ml-2 px-3 py-1 border rounded text-sm hover:bg-gray-50 text-gray-700">오늘</button>
          </div>
          <div className="w-20"></div> 
        </header>
        <div className="flex-1 p-4 overflow-hidden bg-white">
          <div ref={calendarRef} className="h-full" />
        </div>
      </main>

      {/* 모달 (기존과 동일) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
             <div className="mb-6"><input type="text" className="w-full text-xl font-bold border-b border-gray-300 pb-2 focus:border-blue-500 focus:outline-none placeholder-gray-400" value={modalValues.title} onChange={(e) => setModalValues({...modalValues, title: e.target.value})} placeholder="일정 제목" /></div>
             <div className="flex flex-col gap-5">
               <div>
                  <div className="flex justify-between items-center mb-2"><label className="text-sm font-bold text-gray-700">일시</label><div className="flex gap-4"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={modalValues.isAllday} onChange={(e) => handleAlldayChange(e.target.checked)} /><span className="text-sm">종일</span></label><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={modalValues.isPrivate} onChange={(e) => setModalValues({...modalValues, isPrivate: e.target.checked})} /><span className="text-sm">비공개 🔒</span></label></div></div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2"><input type="date" className="flex-1 border px-3 py-2 rounded" value={formatDate(modalValues.start)} onChange={(e) => handleDateChange('start','date',e.target.value)} />{!modalValues.isAllday && <input type="time" className="w-36 border px-3 py-2 rounded" value={formatTime(modalValues.start)} onChange={(e) => handleDateChange('start','time',e.target.value)} />}</div>
                    <div className="flex justify-center text-gray-400">⬇</div>
                    <div className="flex gap-2"><input type="date" className="flex-1 border px-3 py-2 rounded" value={formatDate(modalValues.end)} onChange={(e) => handleDateChange('end','date',e.target.value)} />{!modalValues.isAllday && <input type="time" className="w-36 border px-3 py-2 rounded" value={formatTime(modalValues.end)} onChange={(e) => handleDateChange('end','time',e.target.value)} />}</div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-bold mb-1">카테고리</label><select className="w-full border rounded px-3 py-2 bg-white" value={modalValues.calendarId} onChange={(e) => setModalValues({...modalValues, calendarId: e.target.value})}>{calendars.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                 <div><label className="block text-sm font-bold mb-1">성격</label><select className="w-full border rounded px-3 py-2 bg-white" value={modalValues.type} onChange={(e) => setModalValues({...modalValues, type: e.target.value})}>{EVENT_TYPES.map(t=><option key={t.code} value={t.code}>{t.name}</option>)}</select></div>
                 <div className="col-span-2"><label className="block text-sm font-bold mb-1">장소</label><input type="text" className="w-full border rounded px-3 py-2" value={modalValues.location} onChange={(e)=>setModalValues({...modalValues, location: e.target.value})} /></div>
                 <div className="col-span-2"><label className="block text-sm font-bold mb-1">상세 내용</label><textarea className="w-full border rounded px-3 py-2 h-24 resize-none" value={modalValues.body} onChange={(e)=>setModalValues({...modalValues, body: e.target.value})} placeholder="내용 입력" /></div>
               </div>
             </div>
             <div className="mt-8 flex justify-end gap-2 border-t pt-4"><button onClick={()=>setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">취소</button><button onClick={handleSaveEvent} className="px-4 py-2 bg-blue-600 text-white rounded">저장</button></div>
           </div>
        </div>
      )}
    </div>
  );
}