// src/components/layout/AdminDropupMenu.jsx
import { useEffect, useRef, useState } from "react";
import { FiChevronUp, FiUsers, FiGlobe, FiShield } from "react-icons/fi";

export default function AdminDropupMenu({
  label = "관리자",
  canHr = false,
  canIp = false,
  onOpenHr,
  onOpenIp,
  onClose,
}) {

  const wrapRef = useRef(null);

  // 바깥 클릭 / ESC 닫기
  useEffect(() => {

    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) onClose?.();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("click", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onDown);
      window.removeEventListener("keydown", onKey);
    };
  },[onClose]);

  return (
    <div ref={wrapRef} className="relative">


      {/* Dropup panel */}

        <div
          className="
            absolute left-2 right-2 bottom-full mb-2
            rounded-2xl overflow-hidden
            border border-white/30
            bg-white/20 backdrop-blur-2xl
            shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.35)]
          "
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {canHr && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-white hover:bg-white/10 transition"
              onClick={() => {
                onClose?.();
                onOpenHr?.();
              }}
            >
              <FiUsers />
              인사관리
            </button>
          )}

          {canIp && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-white hover:bg-white/10 transition"
              onClick={() => {
                onClose();
                onOpenIp?.();
              }}
            >
              <FiGlobe />
              IP관리
            </button>
          )}

          {!canHr && !canIp && (
            <div className="px-3 py-2 text-xs text-white/70">
              접근 권한이 없습니다.
            </div>
          )}
        </div>

    </div>
  );
}
