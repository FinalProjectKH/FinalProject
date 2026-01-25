// src/components/attendance/AttendanceSummaryCard.jsx
import { Clock3 } from "lucide-react";

/**
 * AttendanceSummaryCard
 * - 백엔드 연동 대비: props로 데이터만 주입 (UI는 순수 컴포넌트)
 * - 단위/표기: 필요한 경우 formatter만 교체하면 됨
 */
const AttendanceSummaryCard = ({
  weeklyLabel = "주간 누적",
  weeklyValueText = "36h 48m",
  progress = 0.68, // 0 ~ 1
  marker = 0.78, // 0 ~ 1 (세로 기준선)
  left = {
    title: "잔여 근무일",
    valueMain: "1",
    valueSub: "일 / 5일",
  },
  left2 = {
    title: "잔여 근무시간",
    valueMain: "10",
    valueSub: "h 4m",
  },
  right = {
    title: "총 근로시간",
    valueMain: "36",
    valueSub: "h 48m",
  },
  right2 = {
    title: "휴가",
    valueMain: "16",
    valueSub: "h 0m",
  },
}) => {
  return (
    <section
      className="
        w-full
        rounded-[28px]
        border border-white/60
        bg-white/35
        backdrop-blur-2xl
        shadow-[0_14px_40px_rgba(0,0,0,0.10)]
        overflow-hidden
      "
      aria-label="근태 요약"
    >
      <div className="px-8 py-6">
        {/* top row */}
        <div className="flex items-center gap-3 text-[13px] text-[#2e1a12]/80">
          <span className="font-medium">{weeklyLabel} :</span>
          <span className="text-[#19b6c6] font-semibold">{weeklyValueText}</span>
        </div>

        {/* progress */}
        <div className="mt-3">
          <ProgressBar value={progress} marker={marker} />
        </div>

        {/* stats grid */}
        <div className="mt-6 grid grid-cols-12 items-stretch">
          {/* left group */}
          <StatBlock
            className="col-span-3"
            title={left.title}
            valueMain={left.valueMain}
            valueSub={left.valueSub}
          />
          <StatBlock
            className="col-span-3"
            title={left2.title}
            valueMain={left2.valueMain}
            valueSub={left2.valueSub}
          />

          {/* divider */}
          <div className="col-span-1 flex items-center justify-center">
            <div className="h-16 w-px bg-[#2e1a12]/20" />
          </div>

          {/* right group */}
          <StatBlock
            className="col-span-3"
            title={right.title}
            valueMain={right.valueMain}
            valueSub={right.valueSub}
          />
          <StatBlock
            className="col-span-2"
            title={right2.title}
            valueMain={right2.valueMain}
            valueSub={right2.valueSub}
          />

          {/* optional icon spot (원하면 제거 가능) */}
          <div className="col-span-0 hidden" aria-hidden="true">
            <Clock3 />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AttendanceSummaryCard;

/* ---------- Sub Components ---------- */

const ProgressBar = ({ value = 0, marker = 0.8 }) => {
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const v = clamp(value);
  const m = clamp(marker);

  return (
    <div className="relative h-[14px] w-full rounded-full bg-[#cfcfcf]/60 overflow-hidden">
      <div
        className="h-full bg-[#19b6c6]"
        style={{ width: `${v * 100}%` }}
      />
      {/* marker line */}
      <div
        className="absolute top-0 h-full w-[2px] bg-[#2e1a12]/45"
        style={{ left: `${m * 100}%` }}
      />
    </div>
  );
};

const StatBlock = ({ className = "", title, valueMain, valueSub }) => {
  return (
    <div className={`px-2 ${className}`}>
      <div className="text-[12px] text-[#2e1a12]/70 font-medium">{title}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-[40px] leading-none font-semibold text-[#111]">
          {valueMain}
        </span>
        <span className="pb-[3px] text-[16px] text-[#111]/80 font-medium">
          {valueSub}
        </span>
      </div>
    </div>
  );
};
