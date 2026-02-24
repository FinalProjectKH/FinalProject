import { useMemo, useState } from "react";
import { CalendarDays, X } from "lucide-react";

function ScheduleModal({ open, onClose, title, items = [] }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="h-12 px-4 flex items-center justify-between border-b">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-xl hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-sm text-black/55">일정이 없습니다.</div>
          ) : (
            <div className="max-h-[420px] overflow-auto space-y-2 pr-1">
              {items.map((e) => (
                <div key={e.id} className="rounded-xl border border-black/10 p-3">
                  <div className="text-sm font-semibold">{e.title}</div>
                  <div className="text-[12px] text-black/55 mt-1">
                    {formatTime(e.start)} ~ {formatTime(e.end)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 pt-0 flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl bg-black/80 text-white text-sm hover:bg-black/90"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// 날짜 포맷은 프로젝트 스타일대로 바꾸세요
function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CalendarCardWithPopup({ selectedDate, events }) {
  const [open, setOpen] = useState(false);

  // 선택일 일정만 뽑기(예: selectedDate=23 같은 방식이면, 실제 날짜 구성에 맞게 조정)
  const selectedItems = useMemo(() => {
    // 여기서는 예시로 “일”만 비교 (실제론 YYYY-MM-DD로 비교 권장)
    return events.filter((e) => new Date(e.start).getDate() === Number(selectedDate));
  }, [events, selectedDate]);

  return (
    <>
      {/* 달력 영역(높이 고정) */}
      <div className="h-[260px]">{/* Toast UI Calendar 들어가는 자리 */}</div>

      {/* 버튼만 달력 아래에 고정 */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[12px] text-black/55">
          선택 날짜: <span className="font-semibold text-black/75">{selectedDate}일</span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="h-9 px-3 rounded-xl border border-white/20 bg-white/15 hover:bg-white/25 text-[12px] text-black/70 flex items-center gap-2"
        >
          <CalendarDays size={16} />
          일정 보기 ({selectedItems.length})
        </button>
      </div>

      <ScheduleModal
        open={open}
        onClose={() => setOpen(false)}
        title={`${selectedDate}일 일정`}
        items={selectedItems}
      />
    </>
  );
}