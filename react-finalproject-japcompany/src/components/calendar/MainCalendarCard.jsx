// MainCalendarCard.jsx
import { useEffect, useMemo, useRef } from "react";
import Calendar from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import { useQuery } from "@tanstack/react-query";
import { axiosApi } from "../../api/axiosAPI"; 

export default function MainCalendarCard({ empNo, deptCode }) {
  const calElRef = useRef(null);
  const calRef = useRef(null);

  // 메인에서는 "이번 달"만 단순 조회(필요하면 주간으로 바꿔도 됨)
  const range = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const iso = (d) => d.toISOString().slice(0, 19);
    return { from: iso(from), to: iso(to) };
  }, []);
  
  const { data: events = [] } = useQuery({
    queryKey:  ["calendarEvents", empNo, deptCode, range.from, range.to ],
    queryFn: async () => {
      const res = await axiosApi.get("/api/calendar", {
        params: { empNo, deptCode: deptCode ?? "", from: range.from, to: range.to  },
      });
      return res.data;
    },
    enabled: !!empNo,
  });

  const toDate = (v) => String(v ?? "").split(" ")[0]; // "2026-02-01"만 추출

  useEffect(() => {
    if (!calElRef.current) return;

    // 1) 최초 1회 달력 생성
    if (!calRef.current) {
      calRef.current = new Calendar(calElRef.current, {
        defaultView: "month",
        useFormPopup: false,
        useDetailPopup: false, // 클릭 시 상세 팝업(조회용)
        isReadOnly: true,     // 메인에서는 조회만
        month: { 
            startDayOfWeek: 0,
            isAlways6Weeks: true,
            visibleEventCount: 5,
        },
        template: {
          time: (event) => {
    return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
              <span style="width: 4px; height: 4px; border-radius: 50%; background-color: ${event.backgroundColor};"></span>
            </div>`;
  },
          // 월간 뷰의 이벤트를 '점'으로 커스텀
          monthDaygridEvent: (event) => {
            return `
            <div style="
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100%;
            ">
          <span style="
              display: inline-block;
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background-color: ${event.backgroundColor};
              margin: 0 1px;
            "></span>
          </div>`;
          },
          monthGridHeaderExceed: () => '',
        },
        calendars: [
          { id: "default", name: "일정" },
        ],
      });
    }

    const cal = calRef.current;

    // 2) 이벤트 다시 그림
    cal.clear();
    const created = events.map((e) => {
        // console.log("변환 중인 이벤트 원본 데이터:", e);
        const d = toDate(e.calStartDt ?? e.start);
        const mappedEvent = {
        id: String(e.calNo ?? e.id),
        calendarId: "default",
        title: e.title?.trim() ? e.title : "•",
        start: `${d}T00:00:00+09:00`,    
        end: `${d}T23:59:59+09:00`,
        category:"allday",
        isAllDay: true,    
        backgroundColor: e.calColor || "#6b3f2a",
        borderColor: "transparent",
        raw: e,
       };
      //  console.log("변환 완료된 데이터 (TUI용):", mappedEvent);
       return mappedEvent; // 반드시 return 해줘야 합니다!
    });

  console.log("created count:", created?.length);

  //  렌더 강제
  cal.render();

  }, [events]);

  return (
      <div className="rounded-2xl bg-white/20 border border-white/25 p-4 shadow-md shadow-black/5 h-[300px]">
        {/* 달력 영역 */}
        <div ref={calElRef}  className = "h-[270px]"/>
      </div>
  );
}