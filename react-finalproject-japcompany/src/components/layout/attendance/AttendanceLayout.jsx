import React from "react";
import { useAuthStore } from "../../../store/authStore";
import Header from "../Header";
import RightSidebar from "./RightSidebar";
import Sidebar from "../Sidebar";
import { Outlet, useNavigate } from "react-router-dom"; // 🔥 useNavigate 추가
import { axiosApi } from "../../../api/axiosAPI";
import { AttendanceContext } from "../../../contexts/AttendanceContext";

const AttendanceLayout = () => {
  const { user, triggerRefresh } = useAuthStore();
  const navigate = useNavigate(); // 🔥 훅 선언

  // 출근 로직
  const handleCheckIn = async () => {
    if (!user || !user.empNo) return alert("로그인 정보가 없습니다.");

    try {
      const response = await axiosApi.post('/api/attendance/check-in', 
        { empNo: user.empNo },
        { withCredentials: true } 
      );

      if (response.status === 200) {
        alert("출근 처리가 완료되었습니다! 오늘도 화이팅하세요! 😊");
        triggerRefresh(); 
      }

    } catch (error) {
      console.error("Check-in Error : ", error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data;

        if (status === 403) {
          alert(`🚫 보안 알림: ${errorMessage}`);
        } else if (status === 400) {
          alert(`⚠️ 알림: ${errorMessage}`);
        } else {
          alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
      } else {
        alert("⚠️ 서버와 통신할 수 없습니다. 네트워크 연결 상태를 확인해 주세요.");
      }
    }
  };

  // 퇴근 로직
  const handleCheckOut = async () => {
    const isConfirmed = window.confirm("퇴근 버튼을 누르시겠습니까?");

    if (!isConfirmed) {
      return;
    }

    if (!user || !user.empNo) {
      alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
      navigate("/login"); // 🔥 새로고침 없이 부드럽게 라우팅!
      return;
    }

    try {
      const response = await axiosApi.post('/api/attendance/check-out', {
        empNo: user.empNo
      });

      if (response.status === 200) {
        alert("퇴근 처리가 완료되었습니다!");
        triggerRefresh(); 
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
            <AttendanceContext.Provider value={{ handleCheckIn, handleCheckOut }}>
            {/* 중앙 대시보드 (Outlet) */}
            <div className="flex-[3] min-w-0">
              <Outlet />
            </div>

            {/* 3. 우측 사이드바 (정보 패널) */}
            <div className="flex-[1] min-w-[300px]">
              <RightSidebar/>
            </div>
            </AttendanceContext.Provider>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AttendanceLayout;