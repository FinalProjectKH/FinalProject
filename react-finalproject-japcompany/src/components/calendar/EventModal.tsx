import React, { useEffect, useState } from 'react';
import { CalendarCategory, ModalState } from './types';

// 📍 대분류(Type) 정의
const CALENDAR_TYPES = [
  { value: '1', label: '내 캘린더' },
  { value: '2', label: '부서 캘린더' },
  { value: '3', label: '전사 캘린더' },
];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  values: ModalState;
  setValues: React.Dispatch<React.SetStateAction<ModalState>>;
  calendars: CalendarCategory[];
  authLevel: number;
  meetingRooms?: string[]; // 🔥 [추가] 회의실 목록 (선택적)
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  values,
  setValues,
  calendars,
  authLevel,
  meetingRooms = [] // 🔥 [추가] 기본값 빈 배열
}: EventModalProps) {
  
  const [selectedType, setSelectedType] = useState('1');

  // 🔥 수정 모드인지 확인
  const isEditMode = values.id && String(values.id).trim() !== '';

  // 모달 열릴 때 대분류 자동 세팅
  useEffect(() => {
    if (isOpen && values.calendarId) {
      const currentCal = calendars.find(c => c.id === values.calendarId);
      if (currentCal) {
        setSelectedType(currentCal.category);
      } else {
        setSelectedType('1');
      }
    }
  }, [isOpen, values.calendarId, calendars]);

  const filteredCategories = calendars.filter(c => c.category === selectedType);

  // 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setValues({ ...values, [name]: checked });
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedType(newType);
    const firstCategoryInNewType = calendars.find(c => c.category === newType);
    if (firstCategoryInNewType) {
        setValues(prev => ({ ...prev, calendarId: firstCategoryInNewType.id }));
    } else {
        setValues(prev => ({ ...prev, calendarId: '' }));
    }
  };

  // 날짜 포맷팅
  const formatDate = (date: Date, isAllday: boolean) => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return isAllday ? d.toISOString().slice(0, 10) : d.toISOString().slice(0, 16);
  };

  const handleDateChange = (name: string, val: string) => {
    setValues({ ...values, [name]: new Date(val) });
  };

  if (!isOpen) return null;

  // 🔥 현재 선택된 장소가 회의실 목록에 있는지 확인
  // 목록에 없으면 'direct'(직접 입력) 모드로 간주
  const isDirectLocation = !meetingRooms.includes(values.location);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] p-6 relative animate-fade-in-down">
        
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? '일정 수정/삭제' : '새 일정 등록'}</h2>
            
            <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        name="isAllday" 
                        checked={values.isAllday} 
                        onChange={handleChange} 
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">종일</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        name="isPrivate" 
                        checked={values.isPrivate} 
                        onChange={handleChange} 
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">비공개</span>
                </label>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
            &times;
          </button>
        </div>

        {/* 폼 내용 */}
        <div className="space-y-5">
            
            {/* 1. 캘린더 분류 선택 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold mb-1 text-gray-500 uppercase tracking-wide">캘린더 종류</label>
                    <select 
                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-gray-50"
                        value={selectedType}
                        onChange={handleTypeChange}
                    >
                        {CALENDAR_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1 text-gray-500 uppercase tracking-wide">상세 카테고리</label>
                    <select 
                        name="calendarId" 
                        value={values.calendarId} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white"
                    >
                        {filteredCategories.length === 0 ? (
                            <option value="">카테고리 없음</option>
                        ) : (
                            filteredCategories.map((cal) => (
                                <option key={cal.id} value={cal.id}>
                                    {cal.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {/* 2. 제목 */}
            <div>
                <label className="block text-xs font-bold mb-1 text-gray-500 uppercase tracking-wide">일정 제목</label>
                <input
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 text-lg font-semibold placeholder-gray-300"
                    placeholder="일정 제목을 입력하세요"
                />
            </div>

            {/* 3. 날짜 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold mb-1 text-gray-500 uppercase tracking-wide">시작</label>
                    <input
                        type={values.isAllday ? "date" : "datetime-local"}
                        value={formatDate(values.start, values.isAllday)}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1 text-gray-500 uppercase tracking-wide">종료</label>
                    <input
                        type={values.isAllday ? "date" : "datetime-local"}
                        value={formatDate(values.end, values.isAllday)}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                </div>
            </div>

            {/* 4. 장소 (회의실 선택 + 직접 입력) */}
            <div>
                <label className="block text-xs font-bold mb-1 text-gray-500 uppercase tracking-wide">장소</label>
                <div className="flex flex-col gap-2">
                    {/* 회의실 선택 Dropdown */}
                    <select
                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white"
                        value={isDirectLocation ? "direct" : values.location}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "direct") {
                                setValues({ ...values, location: "" }); // 직접 입력 모드로 초기화
                            } else {
                                setValues({ ...values, location: val }); // 선택한 회의실로 설정
                            }
                        }}
                    >
                        <option value="direct">(직접 입력)</option>
                        {meetingRooms.map((room) => (
                            <option key={room} value={room}> {room}</option>
                        ))}
                    </select>

                    {/* 직접 입력 Input (직접 입력 모드일 때만 보임 or 항상 보이게 할 수도 있음) */}
                    {isDirectLocation && (
                        <input 
                            type="text" 
                            name="location" 
                            value={values.location || ''} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 animate-fade-in" 
                            placeholder="장소를 직접 입력하세요"
                            autoFocus
                        />
                    )}
                </div>
            </div>

            {/* 5. 내용 */}
            <div>
                <label className="block text-xs font-bold mb-1 text-gray-500 uppercase tracking-wide">메모</label>
                <textarea
                    name="body"
                    value={values.body || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded h-24 resize-none focus:outline-none focus:border-blue-500"
                    placeholder="상세 내용을 입력하세요"
                />
            </div>

            {/* 6. 버튼 영역 (삭제/저장) */}
            <div className="flex justify-between mt-4 pt-4 border-t">
                {/* 왼쪽: 삭제 버튼 (수정 모드일 때만) */}
                <div>
                    {isEditMode && (
                        <button 
                            onClick={() => {
                                if(window.confirm("정말 이 일정을 삭제하시겠습니까?")) onDelete();
                            }} 
                            className="px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-md font-medium border border-transparent hover:border-red-100"
                        >
                            삭제
                        </button>
                    )}
                </div>

                {/* 오른쪽: 취소 / 저장 버튼 */}
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium">
                        취소
                    </button>
                    <button onClick={onSave} className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-bold">
                        {isEditMode ? '수정 완료' : '일정 등록'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}