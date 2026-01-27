import { Route, Routes } from "react-router-dom";
import MyCalendar from "./pages/Calendar";
import MainLayout from "./components/layout/MainLayout";
import AttendanceLayout from "./components/layout/attendance/AttendanceLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";

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
    </Routes>
  );
};

export default App;
