// pages/Main.jsx
import { useState } from "react";
import { CenterModal } from "../components/modal";

const Main = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      {/* 전체 메인 레이아웃: 좌(큰 카드) + 우(큰 카드) */}
      <div className="grid grid-cols-12 gap-10">
        {/* LEFT BIG CARD */}
        <section
          onClick={() => setOpenModal(true)}
          className="
            col-span-8 h-[520px]
            rounded-[34px]
            bg-gradient-to-br from-[#5a3827] to-[#7a4a33]
            shadow-[0_35px_80px_rgba(0,0,0,0.25)]
            border border-white/10
            cursor-pointer
            relative
            overflow-hidden
          "
        >
          {/* 은은한 광원(글래스 느낌) */}
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

          <div className="p-10 h-full flex items-start gap-10">
            {/* 캘린더 박스 (화이트 카드) */}
            <div className="w-[360px] rounded-3xl bg-white/92 shadow-[0_10px_30px_rgba(0,0,0,0.18)] p-6">
              {/* 상단 컨트롤(월/년도/화살표) - 실제 캘린더 라이브러리 붙이기 전 더미 */}
              <div className="flex items-center justify-between mb-4">
                <button className="h-9 w-9 rounded-full bg-black/5 hover:bg-black/10" />
                <div className="flex gap-3">
                  <div className="h-9 w-24 rounded-lg bg-black/5" />
                  <div className="h-9 w-20 rounded-lg bg-black/5" />
                </div>
                <button className="h-9 w-9 rounded-full bg-black/5 hover:bg-black/10" />
              </div>

              {/* 캘린더 그리드 더미 */}
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-black/50 py-1">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 1; // 더미
                  const isActive = day === 8 || day === 12; // 9,13 느낌
                  const isMid = day === 9 || day === 10 || day === 11; // 가운데 연한 블럭 느낌

                  return (
                    <div
                      key={i}
                      className={[
                        "h-9 flex items-center justify-center rounded-lg",
                        day < 1 || day > 30 ? "text-black/20" : "text-black/80",
                        isActive ? "bg-[#1f1f1f] text-white" : "",
                        isMid ? "bg-black/5" : "",
                      ].join(" ")}
                    >
                      {day >= 1 && day <= 30 ? day : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 오른쪽 요약 라인(디자인의 흰 줄 3개) */}
            <div className="flex-1 pt-6">
              <div className="space-y-4">
                <Line />
                <Line w="w-3/4" />
                <Line w="w-2/3" />
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT BIG CARD */}
        <section
          className="
            col-span-4 h-[520px]
            rounded-[34px]
            bg-gradient-to-br from-[#4e2f21] to-[#7a4a33]
            shadow-[20px_20px_45px_rgba(0,0,0,0.28)]
            relative
            overflow-hidden
          "
        >
          {/* 은은한 광원 */}
          <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="p-10 h-full text-white">
            {/* 상단 아이콘 영역(날씨/상태) */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md" />
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md" />
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md" />
            </div>

            {/* 중간 구분선 */}
            <div className="h-px bg-white/20 mb-10" />

            {/* 본문 라인들 */}
            <div className="space-y-6">
              <Line white w="w-4/5" />
              <Line white w="w-3/5" />
              <div className="h-px bg-white/20 my-8" />
              <Line white w="w-4/5" />
              <Line white w="w-2/3" />
            </div>
          </div>
        </section>
      </div>

      {/* 중앙 카드 클릭 시 모달 */}
      <CenterModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};

const Line = ({ w = "w-full", white = false }) => (
  <div
    className={[
      "h-[6px] rounded-full",
      w,
      white ? "bg-white/70" : "bg-white/70",
    ].join(" ")}
  />
);

export default Main;