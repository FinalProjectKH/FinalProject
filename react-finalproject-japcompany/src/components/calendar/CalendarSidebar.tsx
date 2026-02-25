import React, { useState } from 'react';
import { HexColorPicker } from "react-colorful"; 
import { CalendarCategory } from './types';
import axios from 'axios';

// 🎨 [추천 색상]
const PRESET_COLORS = [
  "#ff4040", "#ff7f50", "#ffbb33", // 빨강, 주황, 노랑
  "#8bc34a", "#2e7d32", "#009688", // 초록 계열
  "#00bcd4", "#2196f3", "#3f51b5", // 파랑 계열
  "#9c27b0", "#e91e63", "#795548", // 보라, 핑크, 갈색
  "#607d8b", "#333333"             // 회색, 검정
];

interface SidebarGroupProps {
  title: string;
  GroupId: string;
  items: CalendarCategory[];
  authLevel: number;
  selectedCalendars: string[];
  
  // 상태 관리 함수들
  onToggle: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, newName: string) => void; 
  
  // 편집(Add) 관련
  addingSection: string | null;
  setAddingSection: (id: string | null) => void;
  newCalendar: { name: string; color: string };
  setNewCalendar: React.Dispatch<React.SetStateAction<{ name: string; color: string }>>;
  handleAddClick: () => void;
  
  // 색상 변경 관련
  colorPickerTarget: string | null;
  setColorPickerTarget: (id: string | null) => void;
  tempColor: string;
  setTempColor: (color: string) => void;
  handleSaveColor: () => void;
}

const SidebarGroup = ({
  title, GroupId, items, authLevel, selectedCalendars,
  onToggle, onDeleteCategory, onRenameCategory,
  addingSection, setAddingSection, newCalendar, setNewCalendar, handleAddClick,
  colorPickerTarget, setColorPickerTarget, tempColor, setTempColor, handleSaveColor
}: SidebarGroupProps) => {
  
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);

  const hasPermission = authLevel >= parseInt(GroupId);
  const validItems = items.filter(item => item.id && item.name);

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
        const target = e.target as HTMLInputElement;
        onRenameCategory(id, target.value);
        target.blur();
    }
  };

  return (
    <div className="mb-4 select-none relative">
      <div className="flex items-center justify-between px-2 py-1 mb-1 group">
        {isEditing ? (
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-sm text-gray-800">{title} 편집</span>
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-green-600 text-sm">완료</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 text-gray-700" onClick={() => setIsOpen(!isOpen)}>
              <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
              <span className="font-bold text-sm">{title}</span>
            </div>
            {hasPermission && (
              <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xs">✏️</button>
            )}
          </>
        )}
      </div>

      {isOpen && (
        <div className="pl-4 pr-2">
          <ul className="space-y-1 mb-2">
            {validItems.map((cal) => {
              const strId = String(cal.id);
              const isChecked = selectedCalendars.includes(strId);
              const displayColor = cal.bgColor || cal.color || '#3b82f6';
              const isPickerOpen = colorPickerTarget === strId;

              return (
                <li key={strId} className="flex items-center justify-between py-1.5 px-1 hover:bg-gray-50 rounded group/item relative">
                  {isEditing ? (
                    <>
                      <input 
                        defaultValue={cal.name}
                        className="text-sm text-gray-700 border border-gray-200 rounded px-2 py-0.5 focus:border-blue-500 outline-none bg-white w-full mr-2 shadow-sm"
                        onKeyDown={(e) => handleNameKeyDown(e, strId)}
                        onBlur={(e) => onRenameCategory(strId, e.target.value)}
                        autoFocus 
                      />
                      <button onClick={() => onDeleteCategory(strId)} className="text-gray-400 hover:text-red-500 shrink-0">❌</button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 cursor-pointer w-full" onClick={() => onToggle(strId)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-300'}`}>
                          {isChecked && <span className="text-white text-[10px] leading-none">✔</span>}
                        </div>
                        <span className={`text-sm truncate ${isChecked ? 'text-gray-700' : 'text-gray-400'}`}>{cal.name}</span>
                      </div>
                      
                      <div className="relative shrink-0">
                          <button
                              className="block w-3 h-3 rounded-full ring-1 ring-gray-200 hover:ring-gray-400"
                              style={{ backgroundColor: displayColor }}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  if(!hasPermission) return;
                                  setColorPickerTarget(strId);
                                  setTempColor(displayColor);
                              }}
                              disabled={!hasPermission}
                          />

                          {isPickerOpen && (
                              <div className="absolute right-0 top-6 z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-3 flex flex-col gap-3"
                                   style={{ width: '220px' }}
                                   onClick={(e) => e.stopPropagation()} 
                              >
                                  <div className="text-xs font-bold text-gray-700">색상 수정</div>
                                  <div className="flex justify-center">
                                      <HexColorPicker color={tempColor} onChange={setTempColor} style={{ width: '100%', height: '120px' }} />
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1.5 justify-center">
                                    {PRESET_COLORS.map(preset => (
                                      <button 
                                        key={preset} 
                                        type="button"
                                        className={`w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform ${tempColor === preset ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                        style={{ backgroundColor: preset }}
                                        onClick={() => setTempColor(preset)}
                                      />
                                    ))}
                                  </div>

                                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                                      <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: tempColor }}></div>
                                      <span className="text-xs font-mono text-gray-600">{tempColor.toUpperCase()}</span>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                      <button onClick={() => setColorPickerTarget(null)} className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">취소</button>
                                      <button onClick={handleSaveColor} className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded font-bold">저장</button>
                                  </div>
                              </div>
                          )}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {!isEditing && hasPermission && (
            addingSection === GroupId ? (
              <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200 flex flex-col gap-2 relative">
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <button 
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: newCalendar.color }}
                      onClick={() => setIsAddPickerOpen(!isAddPickerOpen)}
                    />
                    {isAddPickerOpen && (
                      <div className="absolute left-0 top-6 z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-3" style={{ width: '210px' }}>
                        <HexColorPicker color={newCalendar.color} onChange={(c) => setNewCalendar({ ...newCalendar, color: c })} style={{ width: '100%', height: '100px' }} />
                        
                        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                             {PRESET_COLORS.map(preset => (
                                 <button 
                                   key={preset} 
                                   type="button"
                                   className={`w-4 h-4 rounded-full border border-gray-200 hover:scale-110 transition-transform ${newCalendar.color === preset ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                   style={{ backgroundColor: preset }} 
                                   onClick={() => { 
                                     setNewCalendar({ ...newCalendar, color: preset }); 
                                   }} 
                                 />
                             ))}
                        </div>
                        <button onClick={() => setIsAddPickerOpen(false)} className="w-full mt-3 text-xs bg-gray-100 hover:bg-gray-200 py-1.5 rounded text-gray-600">닫기</button>
                      </div>
                    )}
                  </div>

                  <input 
                    type="text" 
                    className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="이름" 
                    value={newCalendar.name} 
                    onChange={(e) => setNewCalendar({ ...newCalendar, name: e.target.value })} 
                    autoFocus 
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setAddingSection(null); setIsAddPickerOpen(false); }} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded">취소</button>
                  <button onClick={handleAddClick} className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded font-bold">저장</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAddingSection(GroupId); setNewCalendar({ name: '', color: '#3b82f6' }); }}
                className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-400 hover:text-blue-600">
                + {title} 추가
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

interface CalendarSidebarProps {
  calendars: CalendarCategory[];
  selectedCalendars: string[];
  onToggle: (id: string) => void;
  onAddCategory: (data: { name: string; color: string; category: string }) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onColorChange: (id: string, color: string) => void;
  authLevel: number;
}

export default function CalendarSidebar({
  calendars,
  selectedCalendars,
  onToggle,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  onColorChange,
  authLevel,
}: CalendarSidebarProps) {
  
  // 상태 관리
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [newCalendar, setNewCalendar] = useState({ name: '', color: '#3b82f6' });
  const [colorPickerTarget, setColorPickerTarget] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>('#000000');

  // 🔥 Vite 환경 변수에서 백엔드 기본 주소 가져오기
  const API_URL = import.meta.env.VITE_BASE_URL;

  // 핸들러
  const handleAddClick = () => {
    if (!newCalendar.name.trim()) return alert("이름을 입력하세요");
    if (!addingSection) return;

    onAddCategory({ 
      name: newCalendar.name, 
      color: newCalendar.color, 
      category: addingSection 
    });

    setNewCalendar({ name: '', color: '#3b82f6' });
    setAddingSection(null);
  };

  const handleSaveColor = () => {
    if (colorPickerTarget && tempColor) {
      onColorChange(colorPickerTarget, tempColor);
      setColorPickerTarget(null);
    }
  };

  // 🔥 공휴일 가져오기 함수 수정
  const handleSyncHolidays = () => {
    if(Number(authLevel) !== 3){
      alert("관리자만 실행할 수 있습니다.");
      return; // 권한 없으면 여기서 함수 종료!
    }

    const nextYear = new Date().getFullYear() + 1;
    const inputYear = prompt("데이터를 가져올 연도를 입력하세요 (예: 2026)", String(nextYear));

    if (!inputYear) return; 

    // 🔥 API 주소에 API_URL을 붙이고 세션 쿠키(withCredentials) 전달 설정 추가
    // post의 두 번째 인자는 body 데이터({})이고, 세 번째 인자가 설정(config)입니다.
    axios.post(`${API_URL}/api/calendar/holidays/sync?year=${inputYear}`, {}, {
      withCredentials: true 
    })
      .then((res) => {
        alert(res.data); 
        window.location.reload(); 
      })
      .catch((err) => {
        console.error(err);
        alert("공휴일 가져오기 실패! (콘솔 확인)");
      });
  };
  // 공통 Props 묶음
  const groupProps = {
    authLevel,
    selectedCalendars,
    onToggle,
    onDeleteCategory,
    onRenameCategory, // 🔥 전달
    addingSection, setAddingSection,
    newCalendar, setNewCalendar, handleAddClick,
    colorPickerTarget, setColorPickerTarget,
    tempColor, setTempColor, handleSaveColor
  };

  

return (
    // 🔥 1. aside에 p-4와 overflow-y-auto를 다시 넣어서 사이드바 전체가 스크롤 되게 만듭니다.
    <aside className="w-64 border-r border-gray-200 p-4 flex flex-col bg-white overflow-y-auto h-full relative pb-10">
      
      <h1 
        className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => window.location.reload()}
        title="새로고침"
      >
        📅 캘린더
      </h1>

      <SidebarGroup title="내 캘린더" GroupId="1" items={calendars.filter(c => String(c.category) === '1')} {...groupProps} />
      <SidebarGroup title="부서 캘린더" GroupId="2" items={calendars.filter(c => String(c.category) === '2')} {...groupProps} />
      
      <div className="border-t border-gray-100 pt-4 mt-2">
        <SidebarGroup title="전사 캘린더" GroupId="3" items={calendars.filter(c => String(c.category) === '3')} {...groupProps} />
      </div>

      {/* 🔥 2. 문제의 mt-auto 싹 빼버리고, 전사 캘린더 바로 밑에 착! 붙였습니다. */}
      {Number(authLevel) === 3 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
            <button 
                onClick={handleSyncHolidays}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
                🔄 공휴일 데이터 가져오기
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2">
                *관리자(Lv.3) 전용 기능
            </p>
        </div>
      )}

    </aside>
  );
}