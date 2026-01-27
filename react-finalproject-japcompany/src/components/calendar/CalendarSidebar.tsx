import React, { useState } from 'react';
import { CalendarCategory } from './types';

interface CalendarSidebarProps {
  calendars: CalendarCategory[];
  selectedCalendars: string[];
  onToggle: (id: string) => void;
  onAddCategory: (data: { typeName: string; color: string; calCategory: string }) => void;
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

  const handleAddClick = () => {
    if (!newCalendar.name.trim()) return alert("이름을 입력하세요");
    if (!addingSection) return;
    onAddCategory({ typeName: newCalendar.name, color: newCalendar.color, calCategory: addingSection });
    setNewCalendar({ name: '', color: '#3b82f6' });
    setAddingSection(null);
  };

  // 내부 컴포넌트: 섹션 그룹
  const SidebarGroup = ({ title, categoryId, items }: { title: string; categoryId: string; items: CalendarCategory[] }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isEditing = editingSection === categoryId;

    // ✅ [복구 완료] 권한 체크: 내 레벨이 카테고리 레벨보다 높거나 같아야 추가/수정 가능
    // (예: authLevel 1(사원) < categoryId 2(부서) -> false)
    const hasPermission = authLevel >= parseInt(categoryId);

    return (
      <div className="mb-4 select-none">
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
              
              {/* ✅ [복구 완료] 권한이 있을 때만 연필(편집) 버튼 노출 */}
              {hasPermission && (
                <button onClick={() => setEditingSection(categoryId)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xs">✏️</button>
              )}
            </>
          )}
        </div>

        {isOpen && (
          <div className="pl-4 pr-2">
            <ul className="space-y-1 mb-2">
              {items.map((cal) => (
                <li key={cal.id} className="flex items-center justify-between py-1.5 px-1 hover:bg-gray-50 rounded group/item">
                  {isEditing ? (
                    <>
                      <span className="text-sm text-gray-600 truncate pl-1">{cal.name}</span>
                      <button onClick={() => onDeleteCategory(cal.id)} className="text-gray-400 hover:text-red-500">❌</button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 cursor-pointer w-full" onClick={() => onToggle(cal.id)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCalendars.includes(cal.id) ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-300'}`}>
                          {selectedCalendars.includes(cal.id) && <span className="text-white text-[10px]">✔</span>}
                        </div>
                        <span className={`text-sm truncate ${selectedCalendars.includes(cal.id) ? 'text-gray-700' : 'text-gray-400'}`}>{cal.name}</span>
                      </div>
                      <div className="relative group/color shrink-0">
                        {/* 권한이 없으면 색상 변경도 막으려면 input disabled 추가 가능 */}
                        <input type="color" value={cal.bgColor} onChange={(e) => onColorChange(cal.id, e.target.value)} 
                               className="absolute inset-0 opacity-0 w-4 h-4 cursor-pointer z-10" disabled={!hasPermission}/>
                        <span className="block w-2.5 h-2.5 rounded-full ring-1 ring-transparent group-hover/color:ring-gray-300" style={{ backgroundColor: cal.bgColor }}></span>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {/* ✅ [복구 완료] 추가 버튼 및 폼: 권한이 있을 때(hasPermission)만 렌더링 */}
            {!isEditing && hasPermission && (
              addingSection === categoryId ? (
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
                <button onClick={() => { setAddingSection(categoryId); setNewCalendar({ name: '', color: '#3b82f6' }); }}
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
      {/* ✅ [복구 완료] 타이틀 클릭 시 새로고침 기능 */}
      <h1 
        className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => window.location.reload()}
        title="새로고침"
      >
        캘린더
      </h1>

      <SidebarGroup title="내 캘린더" categoryId="1" items={calendars.filter(c => c.category === '1')} />
      <SidebarGroup title="부서 캘린더" categoryId="2" items={calendars.filter(c => c.category === '2')} />
      
      {/* 전사 캘린더는 목록 자체는 보여주되, 추가/수정 권한은 내부 SidebarGroup에서 hasPermission으로 제어됨 */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        <SidebarGroup title="전사 캘린더" categoryId="3" items={calendars.filter(c => c.category === '3')} />
      </div>
    </aside>
  );
}