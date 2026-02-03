// src/components/layout/RightSidebar.jsx
import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

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
  // 현재 시간을 관리할 상태(State) 추가
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      // 년, 월, 일 추출
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');

      // 요일 추출(KST 기준)
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = dayNames[now.getDay()];

      // 상태 업데이트
      setCurrentDate(`${year}년 ${month}월 ${date}일 (${dayOfWeek})`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 1초마다 현재 시간을 업데이트하는 효과(Effect) 추가
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // 정리(Cleanup)
  }, []);

  // 시간 포맷팅 함수
  const formatTime = (date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const Item = ({ id, label }) => {
    const isActive = active === id;
    return (
      <button type="button" onClick={() => onSelect?.(id)} className="w-full text-left">
        <div className={["py-5 px-6", "text-[18px] tracking-[-0.2px]", isActive ? "text-[#2e1a12] font-semibold" : "text-[#2e1a12]/90"].join(" ")}>
          {label}
        </div>
        <div className="mx-6 h-px bg-[#2e1a12]/15" />
      </button>
    );
  };

  const time = new Date().toLocaleTimeString();

  return (
    <aside className="absolute right-6 top-1/2 -translate-y-1/2 mt-8" style={{ width, height }}>
      <div className="relative h-full rounded-[34px] bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_18px_55px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="relative h-full p-8 flex flex-col">
          {/* Top clock card */}
          <div>
            <div className="flex flex-col items-center gap-3">
              {/* <Clock3 className="h-9 w-9 text-[#3b241b]" /> */}
              {/* 4. 기존 {now} 대신 실시간으로 흐르는 {formatTime(currentTime)} 사용! */}
              <div className="text-[18px] font-semibold text-[#3b241b]">
                {/* {formatTime(currentTime)} */}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* 날짜 표시 부분 */}
            <div className="text-[20px] font-medium text-[#2e1a12]/60 mb-1">
              {currentDate}
            </div>

            {/* 기존 시계 표시 부분 */}
            <div className="text-[28px] font-bold text-[#2e1a12]">
              {time}
            </div>
          </div>

          {/* time row */}
          {/* <div className="mt-6 flex items-center justify-between text-[16px] text-[#3b241b]/80 px-1">
            <span className="font-medium">{startTime}</span>
            <span className="text-[#3b241b]/35 tracking-[2px]">
              &raquo;&raquo;&raquo;&raquo;&raquo;&raquo;&raquo;
            </span>
            <span className="font-medium">{workedTime}</span>
          </div> */}

          {/* buttons */}
          <div className="mt-5 flex gap-5">
            <button
              type="button"
              onClick={() => {
                console.log("1. 사이드바 버튼 클릭 확인");
                if (onClockIn) {
                  console.log("2. 부모 함수(onClockIn) 존재 확인");
                  onClockIn(); // 여기서 부모의 handleClockIn이 실행되어야 해!
                } else {
                  console.error("2. 부모 함수가 전달되지 않음!");
                }
              }}
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