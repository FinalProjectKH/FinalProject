// components/modal/ProfileModal.jsx
import { useNavigate } from "react-router-dom";
import { axiosApi } from "../../api/axiosAPI";
import { useAuthStore } from "../../store/authStore";

const ProfileModal = ({ open, onClose, onOpenMyInfo, onOpenPassword }) => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s)=>s.setUser);

  if (!open) return null;

  const handleLogout = async () => {
     if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      await axiosApi.post("/employee/logout");
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  };

  return (
    <div className="absolute top-16 right-10 z-50">
      <div className="w-[240px] rounded-2xl bg-white/40 backdrop-blur-xl shadow-xl p-4">
        <MenuItem label="내 정보 설정" onClick={onOpenMyInfo} />
        <Divider />
        <MenuItem label="보안 설정" onClick={onOpenPassword}/>
        <Divider />
        <MenuItem label="로그아웃" onClick={handleLogout}/>
      </div>
    </div>
  );
};

const MenuItem = ({label, onClick }) => (
  <div 
  onClick={onClick}
  className="py-3 text-sm cursor-pointer hover:opacity-80">
    {label}
  </div>
);

const Divider = () => (
  <div className="h-px bg-black/10 my-2" />
);

export default ProfileModal;
