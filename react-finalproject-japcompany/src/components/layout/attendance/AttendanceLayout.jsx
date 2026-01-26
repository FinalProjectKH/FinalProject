import Sidebar from "../Sidebar";
import Header from "../Header";
import RightSidebar from "./RightSidebar";
import AttendanceMain from "./AttendanceMain";

const AttendanceLayout =()=>{
    return(
    <div className="min-h-screen bg-[#f1f1f1] relative">
        
     {/* background */}
     <div className="absolute inset-0 bg-[url('/image/bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-40 z-0" />

        {/* content */}
        <div className="relative z-10">
          <Sidebar />
            
            
          <div className="ml-[240px] min-h-screen">
            <div className="w-full px-10">
              <Header />
              <AttendanceMain/>
            </div>
          </div>
          <RightSidebar/>
        </div>   

  </div>
    );
};

export default AttendanceLayout;