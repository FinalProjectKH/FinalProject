import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

const AttendanceWeeklyList = ({ onPrevWeek, onNextWeek }) => {
  const [records, setRecords] = useState({});
  const [weekRange, setWeekRange] = useState("2026.01.26 ~ 2026.02.01");
  const { user, refreshTrigger } = useAuthStore();

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const todayKey = dayNames[new Date().getDay()]; 
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const days = [
    { key: "월", isWeekend: false }, { key: "화", isWeekend: false },
    { key: "수", isWeekend: false }, { key: "목", isWeekend: false },
    { key: "금", isWeekend: false }, { key: "토", isWeekend: true },
    { key: "일", isWeekend: true },
  ];

  const fetchAttendance = async () => {
    if (!user || !user.empNo) return;
    try {
      setIsCheckedIn(false);
      const response = await axios.get(`http://localhost:80/api/attendance/weekly/${user.empNo}`);
      const data = response.data;
      const newRecords = {};

      data.forEach(item => {
        const dateObj = new Date(item.workDate);
        const dayName = dayNames[dateObj.getDay()];
        newRecords[dayName] = {
          in: item.startTime?.split('T')[1]?.substring(0, 5) || '-',
          out: item.endTime?.split('T')[1]?.substring(0, 5) || '-'
        };
        if (dayName === todayKey && item.startTime) {
          setIsCheckedIn(true);
        }
      });
      setRecords(newRecords);
    } catch (error) {
      console.error("데이터 로드 실패 : ", error);
    }
  };

  // ✅ Layout에서 triggerRefresh()를 호출하면 여기가 실행됨!
  useEffect(() => {
    fetchAttendance();
  }, [user, refreshTrigger]);

  return (
    <section className="w-full h-[380px] rounded-[28px] border border-white/60 bg-white/35 backdrop-blur-2xl shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
      <div className="px-8 py-6 h-full flex flex-col">
        {/* ... (상단 헤더 및 요일 헤더는 기존 코드와 동일) ... */}
        
        <div className="mt-4 grid grid-cols-7 gap-2 flex-1">
          {days.map((day) => {
            const isTodayAndCheckedIn = (day.key === todayKey && isCheckedIn);
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer
                  ${day.isWeekend ? "bg-gray-50 text-gray-400" : "bg-white"}
                  ${isTodayAndCheckedIn ? "ring-2 ring-emerald-500 ring-offset-2" : day.key === selectedDay ? "border-indigo-400 shadow-md" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="text-[13px] text-[#19b6c6]">출근 : {records[day.key]?.in || '-'}</div>
                <div className="text-[13px] text-[#d37545]">퇴근 : {records[day.key]?.out || '-'}</div>
                {isTodayAndCheckedIn && <span className="text-[11px] font-semibold text-[#19b6c6]">TODAY</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AttendanceWeeklyList;