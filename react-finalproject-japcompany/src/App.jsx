import { BrowserRouter, Route, Routes } from "react-router-dom";
import MyCalendar from "./pages/Calendar";
import MainLayout from "./components/layout/MainLayout";
import AttendanceLayout from "./components/layout/attendance/AttendanceLayout";
import LoginPage from "./pages/LoginPage";
import NotFound from './pages/NotFound';


const App = () => {
  return (
    <>

    
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path = "/attendance" element={<AttendanceLayout/>} ></Route>
        <Route path = "/calendar" element={<MyCalendar/>} ></Route>




        <Route path="*" element={<NotFound />}></Route> 
        {/* 얘를 제일 마지막에 작성해서 없는 경로 전부 404처리 */}
      </Routes>
    

    </>
  );
};

export default App;