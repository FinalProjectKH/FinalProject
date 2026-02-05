import { Route, Routes } from "react-router-dom";
import MyCalendar from "./pages/Calendar";
import MainLayout from "./components/layout/MainLayout";
import AttendanceLayout from "./components/layout/attendance/AttendanceLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Approval from "./pages/Approval";
import ApprovalHome from "./components/approval/ApprovalHome";
import ApprovalWrite from "./components/approval/ApprovalWrite";

const App = () => {
  return (
    <Routes>
      {/* 로그인 */}
      <Route path="/" element={<LoginPage />} />

      {/* 로그인 후 */}
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendanceLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <MyCalendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/approval"
        element={
          <ProtectedRoute>
            <Approval />
          </ProtectedRoute>
        }
      >
        {/* 1. 전자결재 홈 (기본 화면) */}
        <Route index element={<ApprovalHome />} />

        {/* 2. 작성 페이지 (:formId는 변수) */}
        <Route path="write/:formId" element={<ApprovalWrite />} />

        {/* 3. 각종 문서함 (일단 임시 텍스트로 연결) */}
        <Route path="wait" element={<div>결재 대기 문서 목록</div>} />
        <Route path="upcoming" element={<div>결재 예정 문서 목록</div>} />
        <Route path="refer" element={<div>참조/열람 문서 목록</div>} />
        <Route path="draft" element={<div>기안 문서 목록</div>} />
        <Route path="temp" element={<div>임시 저장 목록</div>} />
        <Route path="approve" element={<div>결재 완료 문서 목록</div>} />
        <Route path="dept" element={<div>부서 문서 목록</div>} />
        <Route path="sign" element={<div>서명 관리 페이지</div>} />
      </Route>
    </Routes>
  );
};

export default App;
