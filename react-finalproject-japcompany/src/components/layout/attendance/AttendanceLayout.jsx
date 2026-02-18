import React from "react";
import { useAuthStore } from "../../../store/authStore";
import Header from "../Header";
import AttendanceMain from "./AttendanceMain";
import RightSidebar from "./RightSidebar";
import Sidebar from "../Sidebar";
import { Outlet } from "react-router-dom";
import { axiosApi } from "../../../api/axiosAPI";

const AttendanceLayout = () => {
  const { user, triggerRefresh } = useAuthStore();

  // 출근 로직
  const handleCheckIn = async () => {
    if (!user || !user.empNo) return alert("로그인 정보가 없습니다.");

    try {

      // 1. 백엔드 호출
      const response = await axiosApi.post('/api/attendance/check-in', 
        { empNo: user.empNo }, // 2번째: 보낼 데이터 (body)
        { withCredentials: true } // 3번째: 설정값 (신분증 지참)
      );

      // 2. 성공 시 처리 (200 OK)
      if (response.status === 200) {
        alert("출근 처리가 완료되었습니다! 오늘도 화이팅하세요! 😊");
        triggerRefresh(); // 카드와 리스트 갱신
      }

    } catch (error) {
      // 3. 에러 상세 처리 (catch 블록 안으로 들어와야 함)
      console.error("Check-in Error : ", error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data;

        // 1. 보안 에러 (403)
        if (status === 403) {
          alert(`🚫 보안 알림: ${errorMessage}`);
        }
        // 2. 비즈니스 로직 에러 (400 - 이미 출근함 등)
        else if (status === 400) {
          alert(`⚠️ 알림: ${errorMessage}`);
        }
        // 3. 기타 서버 에러 (500 등)
        else {
          alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
      } else {
        // 4. 네트워크 연결 자체가 끊긴 경우
        alert("⚠️ 서버와 통신할 수 없습니다. 네트워크 연결 상태를 확인해 주세요.");
      }
    }
  };

  // 퇴근 로직 (출근과 형식을 맞췄어!)
  const handleCheckOut = async () => {

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
      const response = await axiosApi.post('/api/attendance/check-out', {
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
      {/* 배경 이미지 */}
      <div className="absolute inset-0 bg-[url('/image/bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-40 z-0" />

      <div className="relative z-10 flex">
        {/* 1. 왼쪽 메뉴 사이드바 */}
        <Sidebar />

        {/* 2. 메인 영역 (헤더 + 콘텐츠 + 우측 사이드바) */}
        <div className="flex-1 ml-[240px] min-h-screen flex flex-col">
          <div className="px-8 w-full">
            <Header />
          </div>

          {/* 콘텐츠와 우측 사이드바를 감싸는 컨테이너 */}
          <div className="flex px-8 pb-8 gap-6 items-stretch">
            {/* 중앙 대시보드 (Outlet) */}
            <div className="flex-[3] min-w-0">
              <Outlet />
            </div>

            {/* 3. 우측 사이드바 (정보 패널) */}
            <div className="flex-[1] min-w-[300px]">
              <RightSidebar 
                onCheckIn={handleCheckIn} 
                onCheckOut={handleCheckOut}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLayout;