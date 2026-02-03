// src/components/attendance/AttendanceMain.jsx
import AttendanceSummaryCard from "./AttendanceSummaryCard";
// 아래 카드는 다음 단계에서 만들 예정 (일단 자리만 잡음)
import AttendanceWeeklyList from "./AttendanceWeeklyList";

const AttendanceMain = () => {

  return (

    <section
      className="
        w-full
        max-w-[900px]
        ml-[5px]
        mr-auto
        flex flex-col
        gap-10
      "
      aria-label="근태관리 메인 콘텐츠"
    >
      {/* 위 카드 */}
      <AttendanceSummaryCard />

      {/* 아래 카드 (다음 단계) */}
      <AttendanceWeeklyList />

    </section>
  );
};

export default AttendanceMain;
