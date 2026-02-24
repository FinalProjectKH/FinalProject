// src/components/layout/RightSidebar.jsx
import { User, Users, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAttendance } from "../../../contexts/AttendanceContext";

const MenuItem = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all 
        ${isActive ? "bg-[#5b2f1f] text-white shadow-md" : "text-[#2e1a12]/70 hover:bg-white/50"
        }`}
    >
      {icon}
      <span className="text-[15px] font-medium">{label}</span>
    </Link>
  );
};

const RightSidebar = ({ width = 280, height = 612 }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState("");
  const { handleCheckIn, handleCheckOut } = useAttendance();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      setCurrentDate(`${year}년 ${month}월 ${date}일 (${dayNames[now.getDay()]})`);
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    // 🛠️ h-full을 추가해서 부모(items-stretch가 적용된 컨테이너)의 높이를 그대로 다 쓰게 해
    <aside className="relative h-full">
      <div className="h-full rounded-[34px] bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_18px_55px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* 🛠️ 내부 flex 컨테이너도 h-full을 줘서 공간을 꽉 채워줘 */}
        <div className="p-8 flex flex-col h-full">
          <div className="flex flex-col items-center mb-8">
            <div className="text-[18px] font-medium text-[#2e1a12]/60 mb-1">{currentDate}</div>
            <div className="text-[32px] font-bold text-[#2e1a12]">
              {currentTime.toLocaleTimeString("ko-KR", { hour12: false })}
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button onClick={handleCheckIn} className="flex-1 rounded-xl bg-[#5b2f1f] text-white py-4 font-bold shadow-lg active:scale-95 transition-transform">출 근</button>
            <button onClick={handleCheckOut} className="flex-1 rounded-xl bg-[#d37545] text-white py-4 font-bold shadow-lg active:scale-95 transition-transform">퇴 근</button>
          </div>

          <nav className="space-y-2">
            <MenuItem to="/attendance/my" icon={<User size={20} />} label="내 근태 관리" />
            <MenuItem to="/attendance/dept" icon={<Users size={20} />} label="부서 근태 관리" />
            <MenuItem to="/attendance/all" icon={<Building2 size={20} />} label="전사 근태 관리" />
          </nav>

          {/* 💡 만약 하단에 여백을 남기고 싶다면 flex-1 같은 빈 div를 넣어도 좋아 */}
          <div className="flex-1"></div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;