// src/pages/Main.jsx
import { useEffect, useMemo, useState } from "react";
import { Clock, LogIn, LogOut, Heart, MessageCircle, Cloud } from "lucide-react";

const Card = ({ title, right, children, className = "" }) => (
  <section className={`rounded-2xl border border-white/20 p-5 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="text-[13px] font-semibold text-black/75">{title}</div>
      {right ? <div className="text-[12px] text-black/55">{right}</div> : <div />}
    </div>
    {children}
  </section>
);

export default function Main() {
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(9);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeText = useMemo(() => {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [now]);

  const dateText = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [now]);

  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* 중앙 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <div className="flex flex-col gap-6">
          {/* 근태 */}
          <Card
            title="근태"
            className="h-[220px] bg-[#f6f2ed]/60 border-[#e5ddd5]/30 shadow-md shadow-black/10"
            right={
              <span className="inline-flex items-center gap-2 text-black/50">
                <Clock size={14} className="text-black/35" />
                {dateText}
              </span>
            }
          >
            <div className="rounded-2xl bg-white/20 border border-white/25 p-4 shadow-md shadow-black/5">
              <div className="text-[22px] font-semibold text-black/80">{timeText}</div>
              <div className="text-[12px] text-black/50 mt-1">오늘 근무: 00:00:00</div>

              <div className="mt-4 flex gap-3">
                <button 
                className="flex-1 rounded-xl px-4 py-2 text-[13px] 
                bg-[#6b3f2a]/90 text-white 
                flex items-center justify-center gap-2 
                shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.25),0_10px_22px_rgba(0,0,0,0.12)]
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-3px_7px_rgba(0,0,0,0.28),0_12px_26px_rgba(0,0,0,0.16)]
                active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.35),inset_0_-1px_2px_rgba(255,255,255,0.10)]
                active:translate-y-[1px]
                transition">
                  <LogIn size={16} />
                  출근
                </button>
                <button 
                className="flex-1 rounded-xl px-4 py-2 text-[13px]
                bg-[#c27a4a]/90 text-white 
                flex items-center justify-center gap-2
                shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.25),0_10px_22px_rgba(0,0,0,0.12)]
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-3px_7px_rgba(0,0,0,0.28),0_12px_26px_rgba(0,0,0,0.16)]
                active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.35),inset_0_-1px_2px_rgba(255,255,255,0.10)]
                active:translate-y-[1px]
                transition">
                  <LogOut size={16} />
                  퇴근
                </button>
              </div>
            </div>
          </Card>

                    {/* 공지/피드 */}
          <Card title="공지 / 피드"
          className="bg-[#f6f2ed]/60 border-[#e5ddd5]/30 backdrop-blur p-5 shadow-md shadow-black/10">
            <div className="rounded-2xl bg-white/20 border border-white/25 p-4 shadow-md shadow-black/5">
              <div className="h-[130px] rounded-xl border border-white/20 bg-white/10" />
              <div className="mt-3 space-y-2">
                <div className="text-[12px] font-semibold text-black/75">사내 공지: 보안 점검</div>
                <div className="text-[12px] text-black/55">금주 금요일 18:00 전체 점검 예정</div>
                <div className="flex justify-end">
                  <button className="text-[12px] text-black/60 hover:text-black/80 flex items-center gap-1">
                    <Heart size={14} className="opacity-60" />
                    좋아요
                  </button>
                </div>
              </div>
            </div>
          </Card>
          </div>
        

            <div className="flex flex-col gap-6">
          {/* 캘린더(자리) */}
          <Card title="캘린더" right="Sep 2025" className="bg-white/15 backdrop-blur shadow-md shadow-black/10">
            <div className="rounded-2xl bg-white/20 border border-white/25 p-4 shadow-md shadow-black/5">
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-black/45 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((d) => {
                  const isSelected = d === selectedDate;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={[
                        "h-9 rounded-xl text-[12px] border transition",
                        isSelected
                          ? "bg-black/80 text-white border-black/10"
                          : "bg-white/10 text-black/70 border-white/15 hover:bg-white/20",
                      ].join(" ")}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-[12px] text-black/55">
                선택 날짜: <span className="font-semibold text-black/75">{selectedDate}일</span>
              </div>

              {/* ✅ 나중에 @toast-ui/calendar 붙일 자리 */}
              {/* <div id="tui-calendar" className="mt-4 h-[240px]" /> */}
            </div>
          </Card>

          {/* 최근 메시지 */}
          <Card title="최근 메시지"
                className="bg-[#f6f2ed]/60 border-[#e5ddd5]/30 shadow-md shadow-black/10">
            <div className="rounded-2xl bg-white/20 border border-white/25 p-4 flex gap-4 items-center shadow-md shadow-black/5">
              <div className="h-12 w-12 border border-white/20 shadow-md shadow-black/10 px-4 py-2 rounded-xl bg-white shadow-inner" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-black/80">김인재 차장</div>
                    <div className="text-[12px] text-black/55">경영</div>
                  </div>
                  <MessageCircle size={18} className="text-black/35" />
                </div>
                <div className="mt-2 text-[12px] text-black/60 truncate">
                  오후 보고서 공유 부탁드립니다.
                </div>
              </div>
            </div>
          </Card>
          </div>
        </div>


        {/* 우측 패널 */}
        <aside className="hidden xl:block">
          <section className="rounded-2xl border border-white/20 bg-white/15 backdrop-blur p-5 sticky top-6 min-h-[565px] shadow-md shadow-black/10">
            <div className="text-[13px] font-semibold text-black/75 mb-3">요약 패널</div>

            <div className="rounded-2xl bg-[#3a1f14]/70 text-white p-4 min-h-[500px] shadow-md shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="text-[12px] opacity-85">날씨</div>
                <div className="flex items-center gap-2 opacity-90">
                  <Cloud size={16} />
                  <span className="text-[12px]">흐림</span>
                </div>
              </div>

              <div className="mt-3 text-[24px] font-semibold">3°</div>

              <div className="mt-5 text-[12px] opacity-85">
                알림/통계/KPI 영역 확장 예정
              </div>
            </div>
          </section>
        </aside>
        
      </div>
    </div>
  );
}
