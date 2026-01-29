import React from 'react';

interface CalendarHeaderProps {
  currentDate: string;
  onNav: (action: 'prev' | 'next' | 'today') => void;
  onChangeView: (view: 'day' | 'week' | 'month') => void;
}

export default function CalendarHeader({ currentDate, onNav, onChangeView }: CalendarHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onChangeView(v)}
              className="px-3 py-1 text-sm bg-white hover:bg-gray-50 border-r last:border-r-0 capitalize"
            >
              {v === 'day' ? '일간' : v === 'week' ? '주간' : '월간'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => onNav('prev')} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">◀</button>
        <span className="text-2xl font-bold text-gray-800">{currentDate}</span>
        <button onClick={() => onNav('next')} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">▶</button>
        <button onClick={() => onNav('today')} className="ml-2 px-3 py-1 border rounded text-sm hover:bg-gray-50 text-gray-700">오늘</button>
      </div>

      <div className="w-20"></div>
    </header>
  );
}