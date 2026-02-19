import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { axiosApi } from "../../../api/axiosAPI";

const AttendanceSummaryCard = () => {
  const { user, refreshTrigger } = useAuthStore();

  const [summary, setSummary] = useState({
    weeklyValueText: "0h 0m",
    progress: 0,
    remainingDays: 5,
    remainingHours: "0",
    remainingMins: "0",
    totalHours: "0",
    totalMins: "0",
    remainingLeave: 0
  });

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user || !user.empNo) return;

      try {
        const results = await Promise.allSettled([
          axiosApi.get(`/api/attendance/weekly/${user.empNo}`),
          axiosApi.get('/api/attendance/leave-info')
        ]);

        let newSummary = { ...summary };

        // 1. 주간 근태 데이터 처리
        if (results[0].status === 'fulfilled') {
          const data = results[0].value.data || [];
          console.log("검거된 데이터:", data);

          if (Array.isArray(data)) {
            let totalMinutes = 0;
            let workedDays = 0;

            data.forEach(record => {
              // 백엔드 workMinutes 우선 사용
              const minutes = Number(record.workMinutes || 0);

              if (minutes > 0) {
                totalMinutes += minutes;
                workedDays++;
              } else if (record.startTime) {
                // 백업 로직
                const start = new Date(record.startTime.replace('T', ' ').split('.')[0]);
                const end = record.endTime
                  ? new Date(record.endTime.replace('T', ' ').split('.')[0])
                  : new Date(new Date(start).setHours(18, 0, 0, 0));

                const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                const finalDiff = diff < 0 ? diff + 540 : diff;

                if (finalDiff > 0) {
                  totalMinutes += finalDiff;
                  workedDays++;
                }
              }
            });

            // 계산 로직은 if문 안에서 딱 한 번만!
            const h = Math.floor(totalMinutes / 60);
            const m = Math.floor(totalMinutes % 60);
            const targetMin = 40 * 60; 
            const remainMin = Math.max(0, targetMin - totalMinutes);

            newSummary = {
              ...newSummary,
              weeklyValueText: `${h}h ${m}m`,
              progress: Math.min(totalMinutes / targetMin, 1),
              remainingDays: Math.max(0, 5 - workedDays),
              remainingHours: String(Math.floor(remainMin / 60)),
              remainingMins: String(Math.floor(remainMin % 60)),
              totalHours: String(h),
              totalMins: String(m),
            };
          }
        } else {
          console.error("주간 근태 데이터 로드 실패:", results[0].reason);
        }

        // 2. 휴가 데이터 처리
        if (results[1].status === 'fulfilled') {
          const leaveData = results[1].value.data?.remainingLeave ?? 0;
          newSummary.remainingLeave = leaveData;
        }

        // 💡 모든 계산이 끝난 후 최종 업데이트
        setSummary(newSummary);

      } catch (error) {
        console.error("데이터 로드 중 치명적 에러:", error);
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
          <StatBlock className="col-span-2" title="잔여 휴가" valueMain={summary.remainingLeave} valueSub="일" />
        </div>
      </div>
    </section>
  );
};

/* 하단 서브 컴포넌트(ProgressBar, StatBlock)는 기존과 동일하게 유지해줘 */
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