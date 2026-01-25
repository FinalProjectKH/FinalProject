import Sidebar from "./Sidebar";
import Header from "./Header";
import Main from "../../pages/Main";

const MainLayout = () => {
 return (

<div className="min-h-screen bg-[#f1f1f1] relative">
  {/* background */}
  <div className="absolute inset-0 bg-[url('/image/bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-40 z-0" />

  {/* content */}
  <div className="relative z-10">
    <Sidebar />

    <div className="ml-[240px] min-h-screen">
      <div className="w-full px-10">
        <Header />
        <Main />
      </div>
    </div>
  </div>
</div>

 );
};

export default MainLayout;