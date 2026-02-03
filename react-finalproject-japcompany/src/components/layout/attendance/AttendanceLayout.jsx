import React from "react";
import axios from "axios";
import { useAuthStore } from "../../../store/authStore";
import Header from "../Header";
import AttendanceMain from "./AttendanceMain";
import RightSidebar from "./RightSidebar";
import Sidebar from "../Sidebar";

const AttendanceLayout = () => {
  const { user, triggerRefresh } = useAuthStore();

  // 출근 로직
  const handleClockIn = async () => {
    if (!user || !user.empNo) return alert("로그인 정보가 없습니다.");

    try {
      // JSON 객체로 사번 전달
      const response = await axios.post('http://localhost:80/api/attendance/check-in', {
        empNo: user.empNo
      });

      if (response.status === 200) {
        alert("출근 처리가 완료되었습니다!");
        triggerRefresh(); // 신호 발송!
      }
    } catch (error) {
      alert(error.response?.data || "출근 처리 중 오류 발생");
    }
  };

  // 퇴근 로직 (출근과 형식을 맞췄어!)
  const handleClockOut = async () => {

    // 1. 브라우저 기본 확인창 띄우기
    const isConfirmed = window.confirm("퇴근 버튼을 누르시겠습니까?");

    // 2. 사용자가 '취소'를 눌렀다면 함수를 여기서 종료!
    if (!isConfirmed) {
      return;
    }

    // 세션 만료 및 비정상적인 접근 방어 코드
    if (!user || !user.empNo) {
      alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
      window.location.href = "/login"; // 로그인 페이지로 이동
      return;
    }

    try {
      // 퇴근도 JSON 객체 형식으로 보내는 것이 서버(Spring)에서 받기 편해!
      const response = await axios.post('http://localhost:80/api/attendance/check-out', {
        empNo: user.empNo
      });

      if (response.status === 200) {
        alert("퇴근 처리가 완료되었습니다!");
        triggerRefresh(); // 신호 발송!
      }
    } catch (error) {
      alert(error.response?.data || "퇴근 처리 중 오류 발생");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] relative">
      {/* 1. 배경 이미지 - z-0 (가장 아래) */}
      <div className="absolute inset-0 bg-[url('/image/bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-40 z-0" />

      {/* 2. 콘텐츠 영역 - z-10 (배경보다 위) */}
      <div className="relative z-10 flex">
        {/* 사이드바가 fixed가 아니라면 flex를 주면 옆으로 붙어! */}
        <Sidebar />

        {/* 메인 영역: 사이드바 너비만큼 왼쪽 마진을 줌 */}
        <div className="flex-1 ml-[240px] min-h-screen">
          <div className="w-full px-10">
            <Header />
            <AttendanceMain />
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <RightSidebar onClockIn={handleClockIn} onClockOut={handleClockOut} />
      </div>
    </div>
  );
};

export default AttendanceLayout;