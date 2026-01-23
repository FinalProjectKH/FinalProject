// components/modal/ProfileModal.jsx
const ProfileModal = ({ open }) => {
  if (!open) return null;

  return (
    <div className="absolute top-16 right-10 z-50">
      <div className="w-[240px] rounded-2xl bg-white/40 backdrop-blur-xl shadow-xl p-4">
        <MenuItem label="프로필 변경" />
        <Divider />
        <MenuItem label="비밀번호 변경" />
      </div>
    </div>
  );
};

const MenuItem = ({ label }) => (
  <div className="py-3 text-sm cursor-pointer hover:opacity-80">
    {label}
  </div>
);

const Divider = () => (
  <div className="h-px bg-black/10 my-2" />
);

export default ProfileModal;
