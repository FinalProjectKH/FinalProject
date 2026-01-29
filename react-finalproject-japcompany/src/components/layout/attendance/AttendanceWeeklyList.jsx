// src/components/attendance/AttendanceWeeklyList.jsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AttendanceWeeklyList = ({
  weekRange = "2026.01.19 ~ 2026.01.25",
  days = [
    { key: "월", isWeekend: false },
    { key: "화", isWeekend: false },
    { key: "수", isWeekend: false },
    { key: "목", isWeekend: false },
    { key: "금", isWeekend: false },
    { key: "토", isWeekend: true },
    { key: "일", isWeekend: true },
  ],
  records = {
    월: { in: "08:50", out: "17:50" },
    화: { in: "08:50", out: "17:50" },
    수: { in: "08:50", out: "17:50" },
    목: { in: "08:50", out: "17:50" },
    금: { in: "-", out: "-" },
    토: { in: "-", out: "-" },
    일: { in: "-", out: "-" },
  },
  today = "수",
  onPrevWeek,
  onNextWeek,
}) => {
  const [selectedDay, setSelectedDay] = useState(today);

  return (
    <section
      className="
        w-full h-[380px]
        rounded-[28px]
        border border-white/60
        bg-white/35 backdrop-blur-2xl
        shadow-[0_14px_40px_rgba(0,0,0,0.10)]
      "
    >
      <div className="px-8 py-6 h-full flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between">
          <button onClick={onPrevWeek}>
            <ChevronLeft className="w-5 h-5 text-[#2e1a12]/70" />
          </button>
          <span className="text-[14px] font-medium text-[#2e1a12]/80">
            {weekRange}
          </span>
          <button onClick={onNextWeek}>
            <ChevronRight className="w-5 h-5 text-[#2e1a12]/70" />
          </button>
        </div>

        {/* day header */}
        <div className="mt-6 grid grid-cols-7 text-center text-[14px]">
          {days.map((d) => (
            <div
              key={d.key}
              className={d.isWeekend ? "text-[#d37545]" : "text-[#2e1a12]/70"}
            >
              {d.key}
            </div>
          ))}
        </div>

        {/* calendar cells */}
        <div className="mt-4 grid grid-cols-7 gap-2 flex-1">
          {days.map((d) => {
            const isSelected = selectedDay === d.key;
            const isToday = today === d.key;

            return (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={[
                  "rounded-[16px] py-4 flex flex-col items-center pt-6 gap-2 transition",
                  "bg-white/40 hover:bg-white/60",
                  d.isWeekend && "text-[#d37545]",
                  isSelected && "ring-2 ring-[#19b6c6] bg-white/70",
                ].join(" ")}
              >
                <div className="text-[13px] text-[#19b6c6]">
                  출 {records[d.key]?.in}
                </div>
                <div className="text-[13px] text-[#d37545]">
                  퇴 {records[d.key]?.out}
                </div>

                {isToday && (
                  <span className="text-[11px] font-semibold text-[#19b6c6]">
                    TODAY
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AttendanceWeeklyList;
