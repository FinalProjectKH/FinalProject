// src/components/layout/RightSidebar.jsx
import { Clock3 } from "lucide-react";

const RightSidebar = ({
  width = 280,      // 1920 기준: 420px
  height = 612,     // 1920 기준: 807px (필요 시 조정)
  active = "MY",    // "MY" | "DEPT" | "ALL"
  onSelect,
  onClockIn,
  onClockOut,
  now = "08:56:39",
  startTime = "08:56:39",
  workedTime = "00:00:00",
}) => {
  const Item = ({ id, label }) => {
    const isActive = active === id;
    return (
      <button
        type="button"
        onClick={() => onSelect?.(id)}
        className="w-full text-left"
      >
        <div
          className={[
            "py-5 px-6",
            "text-[18px] tracking-[-0.2px]",
            isActive ? "text-[#2e1a12] font-semibold" : "text-[#2e1a12]/90",
          ].join(" ")}
        >
          {label}
        </div>
        <div className="mx-6 h-px bg-[#2e1a12]/15" />
      </button>
    );
  };

  return (
    <aside
      className="fixed right-6 top-1/2 -translate-y-1/2 mt-8"
      style={{ width, height }}
      aria-label="근태 관리 사이드바"
    >
      {/* Card */}
      <div className="relative h-full rounded-[34px] bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_18px_55px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* soft inner glow */}
        <div className="pointer-events-none absolute inset-0 rounded-[34px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-white/40 blur-3xl" />

        <div className="relative h-full p-8 flex flex-col">
          {/* Top clock card */}
          <div className="rounded-[26px] bg-white/55 border border-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.08)] px-6 py-6">
            <div className="flex flex-col items-center gap-3">
              <Clock3 className="h-9 w-9 text-[#3b241b]" />
              <div className="text-[18px] font-semibold text-[#3b241b]">
                {now}
              </div>
            </div>
          </div>

          {/* time row */}
          <div className="mt-6 flex items-center justify-between text-[16px] text-[#3b241b]/80 px-1">
            <span className="font-medium">{startTime}</span>
            <span className="text-[#3b241b]/35 tracking-[2px]">
              &raquo;&raquo;&raquo;&raquo;&raquo;&raquo;&raquo;
            </span>
            <span className="font-medium">{workedTime}</span>
          </div>

          {/* buttons */}
          <div className="mt-5 flex gap-5">
            <button
              type="button"
              onClick={onClockIn}
              className="flex-1 rounded-[10px] bg-[#5b2f1f] text-white py-3 font-semibold shadow-[0_10px_18px_rgba(0,0,0,0.12)] active:translate-y-[1px]"
            >
              출 근
            </button>
            <button
              type="button"
              onClick={onClockOut}
              className="flex-1 rounded-[10px] bg-[#d37545] text-white py-3 font-semibold shadow-[0_10px_18px_rgba(0,0,0,0.10)] active:translate-y-[1px]"
            >
              퇴 근
            </button>
          </div>

          {/* menu */}
          <nav className="mt-10 flex-1">
            <Item id="MY" label="내  근태 관리" />
            <Item id="DEPT" label="부서  근태 관리" />
            <Item id="ALL" label="전사  근태 관리" />
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
