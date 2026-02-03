import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ✅ 날짜를 넣으면 해당 주의 '월요일' 객체를 반환하는 함수
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  // 일요일(0)이면 6일을 빼고, 나머지는 (요일-1)만큼 뺌
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const AttendanceWeeklyList = ({ onPrevWeek, onNextWeek }) => {
  const [records, setRecords] = useState({});

  // 1. 이번 주 월요일을 찾는 함수
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  // 2. 기준이 되는 월요일 상태(기본값: 이번 주 월요일)
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));

  // 3. 날짜 범위를 "2026.01.26 ~ 2026.02.01" 형식으로 만드는 함수
  const formatWeekRange = (monday) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d) => d.toISOString().split('T')[0].replace(/-/g, '-');
    return `${fmt(monday)} ~ ${fmt(sunday)}`;
  };

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


  const handleNextWeek = () => {
    console.log("next 버튼 클릭됨");

    // 1. 현재 월요일을 복사해서 새로운 날짜 객체 생성 (이름: nextWeekMonday)
    const nextWeekMonday = new Date(currentMonday);
    nextWeekMonday.setDate(currentMonday.getDate() + 7);

    // 2. 이번 주 월요일이 언제인지 계산 (비교용)
    const thisMonday = getMonday(new Date());

    // 3. [미래 방지] 다음 주 월요일이 이번 주보다 크면(미래면) 실행 중단!
    if (nextWeekMonday > thisMonday) {
      alert("미래 날짜는 조회할 수 없습니다.");
      return;
    }

    // 4. [상태 업데이트] 계산된 'nextWeekMonday'를 넣어줌
    console.log("새로 설정될 날짜 : ", nextWeekMonday);
    setCurrentMonday(nextWeekMonday);
  };

  const handlePrevWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(newMonday);
  };


  const fetchAttendance = async () => {
    if (!user || !user.empNo) return;
    try {
      setIsCheckedIn(false);

      const startDate = currentMonday.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      // API 호출 시 startDate 파라미터 전달
      const response = await axios.get(`http://localhost:80/api/attendance/weekly/${user.empNo}?startDate=${startDate}`);
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
      setWeekRange(formatWeekRange(currentMonday)); // 화면에 표시될 날짜 범위 업데이트
    } catch (error) {
      console.error("데이터 로드 실패 : ", error);
    }
  };

  // ✅ Layout에서 triggerRefresh()를 호출하면 여기가 실행됨!
  // * useEffect : 배열안에 넣은 값이 변할 때만 내 안의 코드를 실행해줘라는 규칙을 가지고 있음
  useEffect(() => {
    fetchAttendance();
  }, [user, refreshTrigger, currentMonday]);

  return (
    <section className="w-full h-[380px] rounded-[28px] border border-white/60 bg-white/35 backdrop-blur-2xl shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
      <div className="px-8 py-6 h-full flex flex-col">

        {/* ✅ 시간을 빼고, 현재 선택된 요일과 상태만 깔끔하게 보여주는 버전 */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevWeek} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-400" />
          </button>

          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800">
              주간 근태 기록 <span className="text-indigo-600 ml-2">[{selectedDay}요일]</span>
            </h2>
            <p className="text-sm font-medium text-slate-400">{weekRange}</p>
          </div>

          <button onClick={handleNextWeek} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight size={24} className="text-slate-400" />
          </button>

          {/* ✅ 중복된 시간 대신 '상태 배지'와 '오늘 표시'만 남기기 */}
          <div className="flex gap-3">
            {selectedDay === todayKey && (
              <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                TODAY
              </span>
            )}
            <div className="bg-slate-100 text-slate-600 px-4 py-1 rounded-full text-xs font-bold border border-slate-200">
              {/* records[selectedDay]?.in 이 '-' 가 아니면 '기록 있음', 아니면 '기록 없음' 등으로 표시 가능 */}
              {records[selectedDay]?.in !== '-' ? "기록 확인됨" : "기록 없음"}
            </div>
          </div>
        </div>

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