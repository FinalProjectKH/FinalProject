import {NavLink} from "react-router-dom";
import { useState } from "react";
import {
  Clock3,
  FileCheck2,
  CalendarDays,
  Mail,
  MessageSquareText,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const [orgOpen, setOrgOpen] = useState(false);
  const [orgPos, setOrgPos] = useState({ x: 250, y: 200 });

  return (
  <>
    <aside className="fixed left-0 top-0 h-screen w-[240px] text-white">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d160f] via-[#3a1f14] to-[#6a402b]" />
      <div className="absolute -top-20 -left-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

      <div className="relative h-full flex flex-col">
        {/* logo */}
        <div className="h-[96px] flex items-center pl-[35px]">
          <NavLink to="/main">
          <div className="h-[60px] w-[60px] bg-[url('/image/logo.png')] bg-contain bg-center bg-no-repeat" />
          </NavLink>
        </div>

        {/* menu */}
        <nav className="mt-2 px-5 space-y-1">
          <MenuItem to = "/attendance" icon={<Clock3 size={20}  />} label="근태관리" />
          <MenuItem  to = "/approval" icon={<FileCheck2 size={20} />} label="전자결재" />
          <MenuItem to = "/calendar" icon={<CalendarDays size={20} />} label="캘린더" />
          <MenuItem icon={<Mail size={20} />} label="메신저" badge={3} onClick={() => setOrgOpen(true)}/>
          <MenuItem icon={<MessageSquareText size={20} />} label="게시판" />
        </nav>

        {/* bottom */}
        <div className="mt-auto px-5 pb-6">
          <button className="group w-full flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/10 transition">
            <Settings size={18} className="text-white/80" />
            <span className="text-sm">설정</span>
          </button>
        </div>
      </div>
    </aside>


{orgOpen && (
  <div className="fixed inset-0 z-50 pointer-events-none">
    <div
      className="fixed w-[420px] h-[520px] rounded-xl bg-white text-black p-4 shadow-xl pointer-events-auto"
      style={{ left: orgPos.x, top: orgPos.y }}
    >
      {/* 드래그 핸들 */}
      <div
        className="flex justify-between items-center mb-3 cursor-move select-none"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          const { x, y } = orgPos;

          const onMove = (ev) => {
            setOrgPos({
              x: x + (ev.clientX - startX),
              y: y + (ev.clientY - startY),
            });
          };

          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };

          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      >
        <h2 className="font-bold">조직도 (임시)</h2>
        <button onClick={() => setOrgOpen(false)}>✕</button>
      </div>

      <div className="h-[460px] overflow-y-auto text-sm text-gray-700">
        여기 나중에 조직도 들어감
      </div>
    </div>
  </div>
)}


    </> 
  );
};

/* =========================
   Menu Item (hover only)
   ========================= */
const MenuItem = ({to, icon, label, badge, onClick }) => {
  const Component = to ? NavLink : "button";

  return (
    <Component
      {...(to ? { to } : { type: "button" })}
      onClick={onClick}
      className="
      group w-full relative flex items-center gap-3
      px-3 py-3 rounded-xl text-left
      transition
    "
    >

    {/* hover overlay */}
    <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
      {/* glass base */}
      <span className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-md border border-white/10" />

      {/* orange gradient border */}
      <span
        className="
          absolute inset-0 rounded-xl p-[1.5px]
          bg-gradient-to-r from-[#D37545] via-[#D37545]/40 to-transparent
          [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]
          [mask-composite:exclude]
        "
      />

      {/* neumorphism highlight */}
      <span className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />
    </span>

    {/* content */}
    <span className="relative text-white/90">{icon}</span>
    <span className="relative text-white font-medium">{label}</span>

    {typeof badge === "number" && (
      <span className="relative ml-auto text-xs bg-[#f2c2a2] text-black px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
    </Component>

  );
};

export default Sidebar;
