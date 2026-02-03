import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

const AttendanceSummaryCard = () => {
  const { user, refreshTrigger } = useAuthStore();
  
  // 상태 관리: 초기값은 0으로 설정
  const [summary, setSummary] = useState({
    weeklyValueText: "0h 0m",
    progress: 0,
    remainingDays: 5,
    remainingHours: "0",
    remainingMins: "0",
    totalHours: "0",
    totalMins: "0"
  });

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.empNo) return;
      try {
        const response = await axios.get(`http://localhost:80/api/attendance/weekly/${user.empNo}`);
        const data = response.data;

        let totalMinutes = 0;
        let workedDays = 0;

        data.forEach(record => {
          if (record.startTime && record.endTime) {
            const start = new Date(record.startTime);
            const end = new Date(record.endTime);
            const diff = (end - start) / (1000 * 60);
            if (diff > 0) {
              totalMinutes += diff;
              workedDays++;
            }
          }
        });

        const h = Math.floor(totalMinutes / 60);
        const m = Math.floor(totalMinutes % 60);
        const targetMin = 40 * 60; // 주 40시간 기준
        const remainMin = Math.max(0, targetMin - totalMinutes);

        setSummary({
          weeklyValueText: `${h}h ${m}m`,
          progress: Math.min(totalMinutes / targetMin, 1),
          remainingDays: Math.max(0, 5 - workedDays),
          remainingHours: String(Math.floor(remainMin / 60)),
          remainingMins: String(Math.floor(remainMin % 60)),
          totalHours: String(h),
          totalMins: String(m)
        });
      } catch (error) {
        console.error("Summary 로드 실패:", error);
      }
    };
    fetchSummary();
  }, [user, refreshTrigger]);

  return (
    <section className="w-full rounded-[28px] border border-white/60 bg-white/35 backdrop-blur-2xl shadow-[0_14px_40px_rgba(0,0,0,0.10)] overflow-hidden">
      <div className="px-8 py-6">
        <div className="flex items-center gap-3 text-[13px] text-[#2e1a12]/80">
          <span className="font-medium">주간 누적 :</span>
          <span className="text-[#19b6c6] font-semibold">{summary.weeklyValueText}</span>
        </div>

        <div className="mt-3">
          <ProgressBar value={summary.progress} marker={0.8} />
        </div>

        <div className="mt-6 grid grid-cols-12 items-stretch">
          <StatBlock className="col-span-3" title="잔여 근무일" valueMain={summary.remainingDays} valueSub="일 / 5일" />
          <StatBlock className="col-span-3" title="잔여 근무시간" valueMain={summary.remainingHours} valueSub={`h ${summary.remainingMins}m`} />
          
          <div className="col-span-1 flex items-center justify-center">
            <div className="h-16 w-px bg-[#2e1a12]/20" />
          </div>

          <StatBlock className="col-span-3" title="총 근로시간" valueMain={summary.totalHours} valueSub={`h ${summary.totalMins}m`} />
          <StatBlock className="col-span-2" title="휴가" valueMain="0" valueSub="h 0m" />
        </div>
      </div>
    </section>
  );
};

/* ---------- Sub Components ---------- */

const ProgressBar = ({ value = 0, marker = 0.8 }) => {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative h-[14px] w-full rounded-full bg-[#cfcfcf]/60 overflow-hidden">
      <div className="h-full bg-[#19b6c6]" style={{ width: `${v * 100}%` }} />
      <div className="absolute top-0 h-full w-[2px] bg-[#2e1a12]/45" style={{ left: `${marker * 100}%` }} />
    </div>
  );
};

const StatBlock = ({ className = "", title, valueMain, valueSub }) => (
  <div className={`px-2 ${className}`}>
    <div className="text-[12px] text-[#2e1a12]/70 font-medium">{title}</div>
    <div className="mt-2 flex items-end gap-1">
      <span className="text-[40px] leading-none font-semibold text-[#111]">{valueMain}</span>
      <span className="pb-[3px] text-[16px] text-[#111]/80 font-medium">{valueSub}</span>
    </div>
  </div>
);

export default AttendanceSummaryCard;
