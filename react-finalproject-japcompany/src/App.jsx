import { Route, Routes } from "react-router-dom";
import MyCalendar from "./pages/Calendar";
import MainLayout from "./components/layout/MainLayout";
import AttendanceLayout from "./components/layout/attendance/AttendanceLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Approval from "./pages/Approval";
import ApprovalHome from "./components/approval/ApprovalHome";
import ApprovalWrite from "./components/approval/ApprovalWrite";
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
        <Route index element={<ApprovalHome />} />

        <Route path="write/:formId" element={<ApprovalWrite />} />
        
        <Route path="wait" element={<ApprovalDocList />} />
        <Route path="upcoming" element={<ApprovalDocList />} />
        <Route path="draft" element={<ApprovalDocList />} />
        <Route path="temp" element={<ApprovalDocList />} />
        <Route path="approve" element={<ApprovalDocList />} />
        <Route path="detail/:docNo" element={<ApprovalDetail />} />
      </Route>
    </Routes>
  );
};

export default App;
