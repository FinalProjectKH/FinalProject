// src/pages/Main.jsx
import { useEffect, useMemo, useState } from "react";
import { Clock, LogIn, LogOut, Heart, MessageCircle, Sun, Cloud, CloudSun, CloudRain, CloudSnow } from "lucide-react";
import { axiosApi } from "../api/axiosAPI";
import { useAttendance } from "../contexts/AttendanceContext";
import { useAuthStore } from "../store/authStore";

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
  const { user, refreshTrigger } = useAuthStore();
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(9);
  const [recentMessage, setRecentMessage] = useState(null);
  const { handleCheckIn, handleCheckOut } = useAttendance();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherDays, setWeatherDays] = useState([]);

  const weatherView = ({ sky, pty }) => {
    // 강수 우선
    if (pty === 1 || pty === 2 || pty === 5 || pty === 6) return { Icon: CloudRain, label: "비" };
    if (pty === 3 || pty === 7) return { Icon: CloudSnow, label: "눈" };
    if (pty === 4) return { Icon: CloudRain, label: "소나기" };

    // 하늘 상태
    if (sky === 1) return { Icon: Sun, label: "맑음" };
    if (sky === 3) return { Icon: CloudSun, label: "구름많음" };
    return { Icon: Cloud, label: "흐림" }; // sky=4
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/weather/now?nx=60&ny=127");
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        console.error("날씨 조회 실패", e);
      }
    })();
  }, []);

  const { Icon, label } = weather ? weatherView(weather) : { Icon: Cloud, label: "로딩" };

  // 3일(오늘/내일/모레) TMN/TMX
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/weather/3days?nx=60&ny=127");
        const data = await res.json();
        setWeatherDays(data); // 3개
      } catch (e) {
        console.error("3일 예보 조회 실패", e);
        setWeatherDays([]);
      }
    })();
  }, []);

  const sizeByIndex = (i) => {
    if (i === 0) return { icon: 48, max: "text-[22px]", min: "text-[13px]" }; // 오늘
    if (i === 1) return { icon: 32, max: "text-[16px]", min: "text-[12px]" }; // 내일
    return { icon: 20, max: "text-[13px]", min: "text-[11px]" }; // 모레
  };

  //근태 시간
  useEffect(() => {
  const fetchToday = async () => {
    if (!user?.empNo) return setTodayAttendance(null);

    try {
      const res = await axiosApi.get(`/api/attendance/weekly/${user.empNo}`);
      const data = res.data || [];

      const todayStr = new Date().toISOString().slice(0, 10);

      const todayRecord =
        data.find(r => String(r.workDate || r.date || "").startsWith(todayStr)) ||
        data.find(r => String(r.startTime || "").startsWith(todayStr));

      const toHHMMSS = (isoLike) => {
        if (!isoLike) return null;
        const t = String(isoLike).split("T")[1];
        return t ? t.split(".")[0] : null;
      };

      const minutesToHHMMSS = (mins) => {
        const totalSec = Math.max(0, Math.floor(Number(mins || 0) * 60));
        const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
        const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
        const ss = String(totalSec % 60).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
      };

      if (!todayRecord) return setTodayAttendance(null);

      setTodayAttendance({
        startText: toHHMMSS(todayRecord.startTime),
        workedText: todayRecord.workMinutes != null ? minutesToHHMMSS(todayRecord.workMinutes) : null,
        hasEnd: Boolean(todayRecord.endTime),
      });
    } catch (e) {
      console.error("오늘 근태 조회 실패", e);
      setTodayAttendance(null);
    }
  };

  fetchToday();
}, [user?.empNo, refreshTrigger]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await axiosApi.get("/dm/preview");
        setRecentMessage(res.data);
      } catch (err) {
        console.error("최근 메시지 조회 실패", err);
      }
    };
    
    fetchRecent();
    const interval = setInterval(fetchRecent, 30000); // 30초마다

    return () => clearInterval(interval); // 메모리 누수 방지
  }, []);

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
              <div className="text-[12px] text-black/50 mt-1">
                {todayAttendance?.hasEnd && todayAttendance?.workedText
                  ? `오늘 근무 : ${todayAttendance.workedText}`
                  : todayAttendance?.startText
                    ? `출근 시간 : ${todayAttendance.startText}`
                    : "오늘 근무 : 00:00:00"}
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                onClick={handleCheckIn}
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
                onClick={handleCheckOut}
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
              <img 
               src="/image/boardImg.jpg"
               alt="게시판 이미지"
               className="h-[130px] w-full rounded-xl border border-white/20 object-cover" />
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
          <Card title="캘린더" right="Sep 2025" className="bg-[#f6f2ed]/60 border-[#e5ddd5]/30 backdrop-blur shadow-md shadow-black/10">
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
              {/* <div className="h-12 w-12 border border-white/20 shadow-md shadow-black/10 px-4 py-2 rounded-xl bg-white shadow-inner" /> */}
              <img
                src={recentMessage?.profileImg || "/image/user.png"}
                alt="프로필"
                className="h-14 w-14 rounded-xl object-cover border border-white/35 shadow-md shadow-black/10 shadow-inner"
                onError={(e) => {
                e.currentTarget.onerror = null; // 무한루프 방지
                e.currentTarget.src = "/image/user.png";
              }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-black/80">
                      {recentMessage?.senderName ?? "최근 메시지 없음"}
                      {" "}
                      {recentMessage?.senderPositionName ?? ""}
                    </div>
                    <div className="text-[12px] text-black/55">
                      {recentMessage?.senderDeptName ?? ""}
                    </div>
                  </div>
                  <MessageCircle size={18} className="text-black/35" />
                </div>
                <div className="mt-2 text-[12px] text-black/60 truncate">
                  {recentMessage?.content ?? ""}
                </div>
              </div>
            </div>
          </Card>
          </div>
        </div>


        {/* 우측 패널 */}
        <aside className="hidden xl:block">
          <section className="rounded-2xl border bg-[#f6f2ed]/30 border-[#e5ddd5]/30 backdrop-blur p-5 sticky top-6 min-h-[557px] shadow-md shadow-black/10">
            <div className="text-[13px] font-semibold text-black/75 mb-3">요약 패널</div>

            <div className="rounded-2xl bg-[#3a1f14]/70 text-white p-4 min-h-[485px] shadow-md shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="text-[12px] opacity-85">날씨</div>
                <div className="flex items-center gap-2 opacity-90">
                  <Icon size={16} />
                  <span className="text-[12px]">{label}</span>
                </div>
              </div>


                {/* 오늘(현재) 크게 */}
                <div className="mt-4 flex items-center gap-7">
                  <Icon size={56} />
                  <div>
                    <div className="text-[34px] font-semibold leading-none">
                      {weather ? `${weather.temp}°` : "-"}
                    </div>
                    <div className="mt-1 text-[12px] opacity-85">
                      {weatherDays?.[0]?.tempMin != null && weatherDays?.[0]?.tempMax != null
                        ? `최저 ${weatherDays[0].tempMin}° / 최고 ${weatherDays[0].tempMax}°`
                        : "최저/최고 -"}
                    </div>
                  </div>
                </div>
                      
                {/* 3일 예보(오늘/내일/모레) */}
                <div className="mt-6 space-y-5">
                  {weatherDays.map((d, i) => {
                    const { icon, max, min } = sizeByIndex(i);
                    const { Icon: DIcon, label: DLabel } = weatherView({ sky: d.sky, pty: d.pty });
                    const dayText = i === 0 ? "오늘" : i === 1 ? "내일" : "모레";
                  
                    return (
                      <div
                        key={d.date ?? i}
                        className="flex items-center justify-between rounded-xl bg-white/10 border border-white/10 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <DIcon size={icon} />
                          <div>
                            <div className="text-[12px] font-semibold">
                              {dayText} <span className="ml-2 text-[11px] opacity-80">{DLabel}</span>
                            </div>
                            <div className="text-[11px] opacity-75">{d.date}</div>
                          </div>
                        </div>
                    
                        <div className="text-right">
                          <div className={`${max} font-semibold leading-none`}>
                            {d.tempMax != null ? `${d.tempMax}°` : "-"}
                          </div>
                          <div className={`${min} opacity-80`}>
                            {d.tempMin != null ? `/${d.tempMin}°` : "/-"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* <div className="mt-6 text-[12px] opacity-85">
                  알림/통계/KPI 영역 확장 예정
                </div> */}


            </div>
          </section>
        </aside>
        
      </div>
    </div>
  );
}
