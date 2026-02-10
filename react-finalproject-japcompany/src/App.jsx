import { Route, Routes } from "react-router-dom";
import MyCalendar from "./pages/Calendar";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Approval from "./pages/Approval";
import ApprovalHome from "./components/approval/ApprovalHome";
import ApprovalWrite from "./components/approval/ApprovalWrite";
import AttendanceMain from "./components/layout/attendance/AttendanceMain";
import AttendanceLayout from "./components/layout/attendance/AttendanceLayout";
import DeptAttendanceLayout from "./components/layout/attendance/DeptAttendanceLayout";
import ApprovalDocList from "./components/approval/ApprovalDocList";
import ApprovalDetail from "./components/approval/ApprovalDetail";

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

      {/* 근태 관리 페이지 (부모) */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendanceLayout />
          </ProtectedRoute>
        }
      >
        {/* 자식들: 얘네들이 바로 AttendanceLayout의 <Outlet /> 자리에 들어가는 애들이야! */}
        <Route path="my" element={<AttendanceMain />} />  {/* 👈 여기서 AttendanceMain을 사용함! */}
        <Route path="dept" element={<DeptAttendanceLayout />} />
      </Route>


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
        <Route index element={<ApprovalHome />} />

        <Route path="write/:formId" element={<ApprovalWrite />} />
        
        <Route path="wait" element={<ApprovalDocList />} />
        <Route path="upcoming" element={<ApprovalDocList />} />
        <Route path="draft" element={<ApprovalDocList />} />
        <Route path="temp" element={<ApprovalDocList />} />
        <Route path="approve" element={<ApprovalDocList />} />
        <Route path="detail/:docNo" element={<ApprovalDetail />} />
      </Route>
    </Routes >
  );
};

export default App;
