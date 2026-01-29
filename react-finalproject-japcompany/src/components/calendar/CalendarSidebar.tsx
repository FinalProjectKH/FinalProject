import React, { useState } from 'react';
import { CalendarCategory } from './types';

interface CalendarSidebarProps {
  calendars: CalendarCategory[];
  selectedCalendars: string[];
  onToggle: (id: string) => void;
  onAddCategory: (data: { name: string; color: string; category: string }) => void;
  onDeleteCategory: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
  authLevel: number;
}

export default function CalendarSidebar({
  calendars,
  selectedCalendars,
  onToggle,
  onAddCategory,
  onDeleteCategory,
  onColorChange,
  authLevel,
}: CalendarSidebarProps) {
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newCalendar, setNewCalendar] = useState({ name: '', color: '#3b82f6' });

  // 카테고리 추가 핸들러
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

  // -------------------------------------------------------------------------
  // 내부 컴포넌트: 섹션 그룹
  // -------------------------------------------------------------------------
  const SidebarGroup = ({ title, GroupId, items }: { title: string; GroupId: string; items: CalendarCategory[] }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isEditing = editingSection === GroupId;

    // 권한 체크 (내 레벨 >= 그룹 레벨)
    const hasPermission = authLevel >= parseInt(GroupId);

    // 🚨 유효한 데이터만 필터링 (ID와 이름이 있는 것만)
    const validItems = items.filter(item => item.id && item.name);

    return (
      <div className="mb-4 select-none">
        {/* 그룹 헤더 */}
        <div className="flex items-center justify-between px-2 py-1 mb-1 group">
          {isEditing ? (
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-sm text-gray-800">{title} 편집</span>
              <button onClick={() => setEditingSection(null)} className="text-gray-500 hover:text-green-600 text-sm">완료</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 text-gray-700" onClick={() => setIsOpen(!isOpen)}>
                <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                <span className="font-bold text-sm">{title}</span>
              </div>
              {hasPermission && (
                <button onClick={() => setEditingSection(GroupId)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xs">✏️</button>
              )}
            </>
          )}
        </div>

        {/* 그룹 내용 */}
        {isOpen && (
          <div className="pl-4 pr-2">
            <ul className="space-y-1 mb-2">
              {validItems.map((cal) => {
                // 🔥 [핵심 수정] ID를 무조건 문자열로 변환 (CalendarPage.js와 통일)
                const strId = String(cal.id);
                const isChecked = selectedCalendars.includes(strId);
                
                // 배경색(bgColor)이 있으면 그걸 쓰고, 없으면 color 사용
                const displayColor = cal.bgColor || cal.color || '#3b82f6';

                return (
                  <li key={strId} className="flex items-center justify-between py-1.5 px-1 hover:bg-gray-50 rounded group/item">
                    {isEditing ? (
                      <>
                        <span className="text-sm text-gray-600 truncate pl-1">{cal.name}</span>
                        <button onClick={() => onDeleteCategory(strId)} className="text-gray-400 hover:text-red-500">❌</button>
                      </>
                    ) : (
                      <>
                        {/* 체크박스 및 이름 영역 */}
                        <div className="flex items-center gap-2 cursor-pointer w-full" onClick={() => onToggle(strId)}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-300'}`}>
                            {isChecked && <span className="text-white text-[10px] leading-none">✔</span>}
                          </div>
                          <span className={`text-sm truncate ${isChecked ? 'text-gray-700' : 'text-gray-400'}`}>{cal.name}</span>
                        </div>
                        
                        {/* 🎨 [색상 변경 영역] */}
                        <div className="relative group/color shrink-0 w-4 h-4">
                           {/* 실제 색상 표시 원 */}
                          <span className="block w-2.5 h-2.5 rounded-full ring-1 ring-transparent group-hover/color:ring-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                                style={{ backgroundColor: displayColor }}></span>
                          
                          {/* 숨겨진 Color Input (투명하게 위에 덮어씌움) */}
                          <input 
                            type="color" 
                            value={displayColor} 
                            onChange={(e) => onColorChange(strId, e.target.value)} 
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                            disabled={!hasPermission} // 권한 없으면 색상 변경 불가
                            title="색상 변경"
                          />
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* 카테고리 추가 폼 */}
            {!isEditing && hasPermission && (
              addingSection === GroupId ? (
                <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200 flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <input type="color" className="w-5 h-5 border-none bg-transparent cursor-pointer rounded-full overflow-hidden shrink-0"
                      value={newCalendar.color} onChange={(e) => setNewCalendar({ ...newCalendar, color: e.target.value })} />
                    <input type="text" className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                      placeholder="이름" value={newCalendar.name} onChange={(e) => setNewCalendar({ ...newCalendar, name: e.target.value })} autoFocus />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setAddingSection(null)} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded">취소</button>
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

  return (
    <aside className="w-64 border-r border-gray-200 p-4 flex flex-col bg-white overflow-y-auto h-full">
      <h1 
        className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => window.location.reload()}
        title="새로고침"
      >
        캘린더
      </h1>

      {/* 🔥 [필수] category가 String 타입이므로 '1', '2', '3' 문자열로 비교 */}
      <SidebarGroup title="내 캘린더" GroupId="1" items={calendars.filter(c => String(c.category) === '1')} />
      <SidebarGroup title="부서 캘린더" GroupId="2" items={calendars.filter(c => String(c.category) === '2')} />
      
      <div className="border-t border-gray-100 pt-4 mt-2">
        <SidebarGroup title="전사 캘린더" GroupId="3" items={calendars.filter(c => String(c.category) === '3')} />
      </div>
    </aside>
  );
}