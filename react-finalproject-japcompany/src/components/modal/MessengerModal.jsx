import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { X, Search } from "lucide-react";
import { ActiveOrg } from "../org/orgTree"; 
import { axiosApi } from "../../api/axiosAPI";
import { useAuthStore } from "../../store/authStore";

export default function MessengerModal({
  open,
  onClose,
  initialPos = { x: 260, y: 180 },
  width = 900,
  height = 560,
}) {
  
  const wsRef = useRef(null);

  const loginMember = useAuthStore((state) => state.user );

  const [pos, setPos] = useState(initialPos);

  // 좌측 탭: chats(대화목록) / org(조직도)
  const [activeTab, setActiveTab] = useState("chats");

  // 대화방 목록
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  //메시지
  const [messages, setMessages] = useState([]);
  
  //자동 스크롤
  const bottomRef = useRef(null);


  // 드래그
  const onDragMouseDown = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y } = pos;

    const onMove = (ev) => {
      setPos({
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
  };

  // 조직도에서 직원 클릭 -> DM 시작(방 찾거나 생성)
  const startDmWith = async(emp) => {
    // emp는 최소 { empNo, empName } 형태라고 가정
    const empNo = emp?.empNo ?? emp?.EMP_NO ?? emp?.id;
    const empName = emp?.empName ?? emp?.EMP_NAME ?? emp?.name ?? "직원";

    if (!empNo) return;
    try {
      
    const res = await axiosApi.post("/dm", { peerEmpNo: empNo });
    const { roomId } = res.data;

    setRooms((prev) => {
      const exists = prev.find((r) => r.roomId === roomId);
      const now = Date.now();

      if (exists) {
        // 기존 방이면 맨 위로 올리기(최근 대화 느낌)
        const moved = prev
          .map((r) => (r.roomId === roomId ? { ...r, updatedAt: now } : r))
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        return moved;
      }

      // 신규 생성
      const next = [
        {
          roomId,
          peerEmpNo: empNo,
          title: empName,
          lastMessage: "",
          unreadCount: 0,
          updatedAt: now,
          messages: [],
        },
        ...prev,
      ];
      return next;
    });

    setActiveRoomId(roomId);
    setActiveTab("chats"); // A안 핵심: “닫기”가 아니라 “대화목록 탭으로 전환”
        } catch (error) {
      console.error("DM 생성 실패", error);
    }
  };

  const activeRoom = useMemo(
    () => rooms.find((r) => r.roomId === activeRoomId) ?? null,
    [rooms, activeRoomId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, activeRoomId]);

  useEffect(() => {
    if (!open) return;

    const fetchRooms = async () => {
      const res = await axiosApi.get("/dm/rooms");
      setRooms(res.data);
    };
    fetchRooms();
  }, [open]);

  const fetchMessages = useCallback(async () => {
    if (!activeRoomId) return;
    try {
     const res = await axiosApi.get(`/dm/${activeRoomId}/messages`);
     setMessages(res.data);
    } catch (error) {
      console.error("메시지 로딩 실패:", error);
    }
  },[activeRoomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
  if (!open) return;

    const ws = new WebSocket("ws://localhost/chattingSock");
    wsRef.current = ws;

    ws.onopen = () => console.log("WS 연결됨", ws.readyState);

    ws.onmessage = (e) => {
      console.log("WS recv raw:", e.data);  
      const msg = JSON.parse(e.data);

      const normalized = {
        messageId: crypto.randomUUID?.() ?? Date.now(),  // 임시 key
        roomId: msg.roomId,
        content: msg.content,
        senderEmpNo:
          String(msg.targetEmpNo) === String(activeRoom?.peerEmpNo)
            ? String(loginMember.empNo)           // 내가 보낸 것
            : String(activeRoom?.peerEmpNo),      // 상대가 보낸 것(대충)
        sentAt: new Date().toISOString(),
      };

      if (String(normalized.roomId) === String(activeRoomId)) {
        setMessages((prev) => [...prev, normalized]);
      }
    };
    ws.onerror = (e) => console.log("WS 에러", e);
    ws.onclose = () => console.log("WS 종료", ws.readyState);
    
    return  () => {
    // open이 false로 바뀔 때만 닫히게
    ws.close();
    wsRef.current = null;
  };
  }, [open, activeRoomId, activeRoom, loginMember]);

  const sendMessage =async()=>{
    if (!activeRoomId || !draft.trim()) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WS 아직 OPEN 아님:", ws?.readyState);
      return;
    }

    const payload = {
      roomId: activeRoomId,
      targetEmpNo: activeRoom.peerEmpNo,
      content: draft,
    };

    console.log("WS send:", payload);
    ws.send(JSON.stringify(payload));

    setDraft("");
  };



  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => (r.title ?? "").toLowerCase().includes(q));
  }, [rooms, query]);

  // const sendMessage = () => {
  //   if (!activeRoomId) return;
  //   const text = draft.trim();
  //   if (!text) return;

  //   setRooms((prev) =>
  //     prev.map((r) => {
  //       if (r.roomId !== activeRoomId) return r;
  //       const now = Date.now();
  //       return {
  //         ...r,
  //         lastMessage: text,
  //         updatedAt: now,
  //         messages: [...(r.messages ?? []), { id: now, mine: true, text, at: now }],
  //       };
  //     }).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  //   );

  //   setDraft("");
  // };

  // open이 false면 렌더 안 함
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="fixed rounded-2xl bg-white text-black shadow-2xl pointer-events-auto overflow-hidden border border-black/10"
        style={{ left: pos.x, top: pos.y, width, height }}
      >
        {/* 헤더(드래그 핸들) */}
        <div
          className="h-12 px-4 flex items-center justify-between cursor-move select-none bg-black/5"
          onMouseDown={onDragMouseDown}
        >
          <div className="font-semibold">메신저</div>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-black/10"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* 바디 */}
        <div className="h-[calc(100%-48px)] grid grid-cols-[340px_1fr] min-h-0">
          {/* 좌측 */}
          <div className="border-r border-black/10 flex flex-col h-full min-h-0">
            {/* 탭 */}
            <div className="px-3 pt-3">
              <div className="grid grid-cols-2 rounded-xl bg-black/5 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("chats")}
                  className={`py-2 rounded-lg text-sm font-medium ${
                    activeTab === "chats" ? "bg-white shadow" : "text-black/60"
                  }`}
                >
                  대화 목록
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("org")}
                  className={`py-2 rounded-lg text-sm font-medium ${
                    activeTab === "org" ? "bg-white shadow" : "text-black/60"
                  }`}
                >
                  조직도
                </button>
              </div>

              {/* 검색(대화목록에서만 의미 있어도 됨) */}
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
                <Search size={16} className="text-black/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="대화/사람 검색"
                  className="w-full text-sm outline-none"
                />
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="mt-3 flex-1 min-h-0 overflow-y-auto px-3 pb-3">
              {activeTab === "chats" ? (
                <div className="space-y-2">
                  {filteredRooms.length === 0 ? (
                    <div className="text-sm text-black/50 px-2 py-3">
                      아직 대화가 없습니다. 조직도에서 사람을 선택해 메신저를 시작하세요.
                    </div>
                  ) : (
                    filteredRooms.map((r) => (
                      <button
                        key={r.roomId}
                        type="button"
                        onClick={() => setActiveRoomId(r.roomId)}
                        className={`w-full text-left rounded-xl px-3 py-3 border transition ${
                          r.roomId === activeRoomId
                            ? "border-black/20 bg-black/5"
                            : "border-black/10 hover:bg-black/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-sm">{r.title}</div>
                          {r.unreadCount > 0 && (
                            <span className="ml-auto text-xs bg-black text-white px-2 py-0.5 rounded-full">
                              {r.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-black/50 line-clamp-1">
                          {r.lastMessage || "대화를 시작해보세요."}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-black/10 bg-white p-2">
                  {/* ✅ ActiveOrg 쪽에서 onEmployeeClick 받아서 호출해주면 됨 */}
                  <ActiveOrg onEmployeeClick={startDmWith} />
                </div>
              )}
            </div>
          </div>

          {/* 우측: 채팅 */}
          <div className="flex flex-col h-full min-h-0">
            {!activeRoom ? (
              <div className="h-full grid place-items-center text-black/50 text-sm">
                대화방을 선택하세요.
              </div>
            ) : (
              <>
                {/* 채팅 헤더 */}
                <div className="h-16 px-4 flex items-center gap-3 border-b border-black/10 bg-white">
                  {/* 아바타(임시: 이니셜) */}
                  <div className="h-10 w-10 rounded-full bg-black/10 grid place-items-center font-semibold">
                    {(activeRoom.title ?? "U").slice(0, 1)}
                  </div>
                            
                  {/* 상대 정보 */}
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight">{activeRoom.title}</div>
                    <div className="text-xs text-black/45 leading-tight">
                      사번: {activeRoom.peerEmpNo}
                      {/* 나중에 부서/직급 들어오면 "· 부서 · 직급" 형태로 붙이기 */}
                    </div>
                  </div>
                            
                  {/* 액션 버튼(나중 기능용 자리) */}
                  <div className="ml-auto flex items-center gap-1">
                    <button type="button" className="h-9 w-9 rounded-lg hover:bg-black/5" title="채팅 내 검색(예정)">
                      <Search size={18} className="text-black/50" />
                    </button>
                    <button type="button" className="h-9 w-9 rounded-lg hover:bg-black/5" title="더보기(예정)">
                      <span className="text-xl leading-none text-black/50">⋯</span>
                    </button>
                  </div>
                </div>


                {/* 메시지 리스트 */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-black/[0.02]">
                  {(messages ?? []).length === 0 ? (
                    <div className="text-sm text-black/45">
                      아직 메시지가 없습니다. 첫 메시지를 보내보세요.
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div
                        key={m.messageId ?? `${m.senderEmpNo}-${m.sentAt}-${idx}`}
                        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                          String(m.senderEmpNo) === String(loginMember.empNo)
                            ? "ml-auto bg-black text-white"
                            : "bg-white border border-black/10"
                        }`}
                      >
                        {m.content}
                        
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* 입력 */}
                <div className="p-3 border-t border-black/10">
                  <div className="flex gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                      }}
                      placeholder="메시지 입력..."
                      className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:opacity-90"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
