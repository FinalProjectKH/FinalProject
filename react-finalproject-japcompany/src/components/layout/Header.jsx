import { useState } from "react";
import { ProfileModal } from "../modal";
import { Search } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import  MyInfoModal from "../modal/MyInfoModal";

const userDefaultImg = "/image/user.png"

const Header = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openMyInfo, setOpenMyInfo] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  const user = useAuthStore((state) => state.user );

  return (
    <header className="relative h-[92px] flex items-center justify-between">
      <div className="w-[240px]" />

      {/* search */}
      <div className="flex-1 flex justify-center">
      <div className="glass w-[620px] rounded-full px-6 py-3 flex items-center gap-3">

          <Search size={18} className="text-black/30" />
          <input
            placeholder="Search"
            className="w-full bg-transparent outline-none text-sm text-black/70 placeholder:text-black/35"
          />
        </div>
      </div>

      {/* right */}
      <div className="w-[240px] flex items-center justify-end gap-4 pr-2">
        <button
          className="flex items-center gap-3 rounded-full px-3 py-2 hover:bg-black/5 transition"
          onClick={() => setOpenProfile((v) => !v)}
        >
          <span className="text-sm text-black/70 font-medium" >
          {user ? user.empNickname : "로그인 필요"}
          {user?.positionName && (
            <span className="ml-1 text-xs text-black/40 font-normal">
              {user.positionName}
            </span>
          )}
          </span>
          <div className="w-10 h-10 rounded-[10px] bg-wait-400 shadow-[0_14px_30px_rgba(0,0,0,0.18)]" >
            <img
              src={user?.profileImg || userDefaultImg}
              className="w-full h-full rounded-[10px] object-cover"
            />
          </div>
        </button>

        {/* hamburger */}
        <button className="w-12 h-12 rounded-full hover:bg-black/5 transition grid place-items-center">
          <div className="space-y-1.5">
            <div className="h-[2px] w-6 bg-black/55 rounded-full" />
            <div className="h-[2px] w-6 bg-black/55 rounded-full" />
            <div className="h-[2px] w-6 bg-black/55 rounded-full" />
          </div>
        </button>
      </div>

       <ProfileModal
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        onOpenMyInfo={() => {
          setOpenProfile(false);
          setOpenMyInfo(true);
        }}
        onOpenPassword={() => {
          setOpenProfile(false);
          setOpenPassword(true);
        }}
      />

      <MyInfoModal
        open={openMyInfo}
        onClose={() => setOpenMyInfo(false)}
       />

      {/* <PasswordModal
        open={openPassword}
        onClose={() => setOpenPassword(false)}
      /> */}

    </header>
  );
};

export default Header;



/*

open
→ ProfileModal(드롭다운)을 보여줄지 말지 결정하는 상태값

onClose
→ 드롭다운을 닫는 함수
(로그아웃 후, 바깥 클릭 처리 등에 사용)

onOpenMyInfo
→ “내 정보 설정” 클릭 시 호출
→ ProfileModal은 닫고, MyInfoModal을 열라고 Header에 알림

onOpenPassword
→ “보안 설정” 클릭 시 호출
→ ProfileModal은 닫고, PasswordModal을 열라고 Header에 알림

*/
