// components/org/EmployeeModal.jsx
import { X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const userDefaultImg = "/image/user.png"


const EmployeeModal = ({ open, onClose, employee }) => {
  const user = useAuthStore((state) => state.user );

  if (!open || !employee) return null;

  const {
    empName,
    empEmail,
    empPhone,
    positionName,
    deptName,
    profileImg,
  } = employee;
  const imgSrc = employee.profileImg || userDefaultImg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[360px] rounded-xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">직원 정보</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="p-4 space-y-4">
          {/* profile */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[13px] bg-gray-200 overflow-hidden">
                <img
                  src={imgSrc}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
            </div>
            <div>
              <div className="font-semibold">{empName}</div>
              <div className="text-sm text-gray-500">
                {positionName} · {deptName ?? "회사"}
              </div>
            </div>
          </div>

          {/* info */}
          <div className="text-sm space-y-1 text-gray-700">
            <div>📧 {empEmail}</div>
            <div>📞 {empPhone}</div>
          </div>

          {/* actions */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
              프로필 보기
            </button>
            <button className="flex-1 rounded-lg bg-[#D37545] text-white px-3 py-2 text-sm hover:opacity-90">
              메시지
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
