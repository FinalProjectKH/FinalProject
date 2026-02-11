// src/components/modal/DraggableModal.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const MARGIN = 16;

let Z = 1000; // 모듈 스코프

const DraggableModal = ({
  open,
  onClose,
  title = "",
  width = 900,
  height = 620,
  children,
}) => {
  const [zIndex, setZIndex] = useState(0);
  const modalRef = useRef(null);

  /* ===== position ===== */
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const dragRef = useRef({
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

    useEffect(() => {
    if (open) setZIndex(++Z);
  }, [open]);



  /* ===== center on open ===== */
  useLayoutEffect(() => {
    if (!open) return;
  



    const el = modalRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setPos({
      x: clamp((vw - rect.width) / 2, MARGIN, vw - rect.width - MARGIN),
      y: clamp((vh - rect.height) / 2, MARGIN, vh - rect.height - MARGIN),
    });
  }, [open]);

  /* ===== ESC close ===== */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /* ===== drag handlers ===== */
  const onPointerDown = (e) => {
    // 버튼 / 입력 영역에서는 드래그 시작 안 함
    if (e.target.closest("button, input, textarea, select, a, label")) return;
    if (e.button !== undefined && e.button !== 0) return;

    dragRef.current = {
      dragging: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: pos.x,
      baseY: pos.y,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    if (dragRef.current.pointerId !== e.pointerId) return;

    const el = modalRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    setPos({
      x: clamp(dragRef.current.baseX + dx, MARGIN, vw - rect.width - MARGIN),
      y: clamp(dragRef.current.baseY + dy, MARGIN, vh - rect.height - MARGIN),
    });
  };

  const onPointerUp = (e) => {
    if (dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current.dragging = false;
    dragRef.current.pointerId = null;
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex }}>

      {/* modal */}
      <section
        ref={modalRef}
        onMouseDown={() => setZIndex(++Z)}
        className="
          absolute
          rounded-2xl
          border border-white/20
          bg-white/30
          backdrop-blur-2xl
          shadow-[0_30px_80px_rgba(0,0,0,0.35)]
          overflow-hidden
        "
        style={{
          left: pos.x,
          top: pos.y,
          width,
          height,
          maxWidth: "92vw",
          maxHeight: "86vh",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* header (drag handle) */}
        <header
          className="
            h-[64px]
            flex items-center justify-between
            px-5
            border-b border-white/20
            cursor-move
            select-none
          "
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="text-[15px] font-semibold text-black/80">
            {title}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/10 transition"
            aria-label="close"
          >
            <X size={18} />
          </button>
        </header>

        {/* body */}
        <div className="h-[calc(100%-64px)] p-5 overflow-y-auto">
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
};

export default DraggableModal;

/* ===== util ===== */
function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
