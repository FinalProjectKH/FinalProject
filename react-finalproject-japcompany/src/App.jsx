import { BrowserRouter, Route, Routes } from "react-router-dom";
import MyCalendar from "./pages/Calendar";
import MainLayout from "./components/layout/MainLayout";
import AttendanceLayout from "./components/layout/attendance/AttendanceLayout";
import LoginPage from "./pages/LoginPage";

const App = () => {
  return (
    <>
    {/* <LoginPage /> */}

    {/* <MainLayout /> */}

    {/* <AttendanceLayout /> */}
    {/* <MyCalendar /> */}

    
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path = "/attendance" element={<AttendanceLayout/>} ></Route>
        <Route path = "/calendar" element={<MyCalendar/>} ></Route>
      </Routes>
    

    </>
  );
};

export default App;