import React from 'react';
import { CalendarCategory, ModalState } from './types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  values: ModalState;
  setValues: React.Dispatch<React.SetStateAction<ModalState>>;
  calendars: CalendarCategory[];
  authLevel: number;
}

export default function EventModal({ isOpen, onClose, onSave, values, setValues, calendars, authLevel }: EventModalProps) {
  if (!isOpen) return null;

  const handleDateChange = (type: 'start' | 'end', field: 'date' | 'time', value: string) => {
    const current = type === 'start' ? values.start : values.end;
    const newDate = new Date(current);
    if (field === 'date') {
      const [y, m, d] = value.split('-').map(Number);
      newDate.setFullYear(y, m - 1, d);
    } else {
      const [h, min] = value.split(':').map(Number);
      newDate.setHours(h, min);
    }
    setValues({ ...values, [type]: newDate });
  };

  const handleAlldayChange = (checked: boolean) => {
    setValues(prev => {
      const s = new Date(prev.start); const e = new Date(prev.end);
      if (checked) { s.setHours(0, 0, 0, 0); e.setHours(23, 59, 59, 999); }
      return { ...prev, isAllday: checked, start: s, end: e };
    });
  };

  const formatDate = (d: Date) => { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${day}`; };
  const formatTime = (d: Date) => { const h = String(d.getHours()).padStart(2, '0'); const m = String(d.getMinutes()).padStart(2, '0'); return `${h}:${m}`; };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
        <div className="mb-6">
          <input type="text" className="w-full text-xl font-bold border-b border-gray-300 pb-2 focus:border-blue-500 focus:outline-none placeholder-gray-400"
            value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} placeholder="일정 제목" autoFocus />
        </div>

        <div className="flex flex-col gap-5">
          {/* 날짜/시간 영역 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700">일시</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" checked={values.isAllday} onChange={(e) => handleAlldayChange(e.target.checked)} />
                  <span className="text-sm">종일</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" checked={values.isPrivate} onChange={(e) => setValues({ ...values, isPrivate: e.target.checked })} />
                  <span className="text-sm">비공개 🔒</span>
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input type="date" className="flex-1 border px-3 py-2 rounded"
                  value={formatDate(values.start)} onChange={(e) => handleDateChange('start', 'date', e.target.value)} />
                {!values.isAllday && <input type="time" className="w-36 border px-3 py-2 rounded"
                  value={formatTime(values.start)} onChange={(e) => handleDateChange('start', 'time', e.target.value)} />}
              </div>
              <div className="flex justify-center text-gray-400">⬇</div>
              <div className="flex gap-2">
                <input type="date" className="flex-1 border px-3 py-2 rounded"
                  value={formatDate(values.end)} onChange={(e) => handleDateChange('end', 'date', e.target.value)} />
                {!values.isAllday && <input type="time" className="w-36 border px-3 py-2 rounded"
                  value={formatTime(values.end)} onChange={(e) => handleDateChange('end', 'time', e.target.value)} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">카테고리</label>
              <select className="w-full border rounded px-3 py-2 bg-white" value={values.calendarId} onChange={(e) => setValues({ ...values, calendarId: e.target.value })}>
                {calendars.map(c => {
                  const isPermitted = parseInt(c.category) <= authLevel;
                  return <option key={c.id} value={c.id} disabled={!isPermitted} className={!isPermitted ? "text-gray-400 bg-gray-100" : ""}>{c.name} {!isPermitted && '🔒'}</option>;
                })}
              </select>
            </div>
            
            {/* 수정됨: 성격(Type)을 자유 입력 텍스트로 변경 */}
            <div>
              <label className="block text-sm font-bold mb-1">캘린더</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2" 
                value={values.type} 
                onChange={(e) => setValues({ ...values, type: e.target.value })} 
                placeholder="예: 회의, 업무, 휴가"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-1">장소</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-1">상세 내용</label>
              <textarea className="w-full border rounded px-3 py-2 h-24 resize-none" value={values.body} onChange={(e) => setValues({ ...values, body: e.target.value })} placeholder="내용 입력" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2 border-t pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">취소</button>
          <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">저장</button>
        </div>
      </div>
    </div>
  );
}