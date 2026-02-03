// components/modal/CenterModal.jsx
import BaseModal from "./BaseModal";

const CenterModal = ({ open, onClose }) => {
  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="w-[420px] rounded-[28px] bg-white/60 backdrop-blur-xl shadow-xl p-8">
        <h2 className="text-lg font-semibold mb-4">임시 모달</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          중앙 카드 클릭 시 표시되는 임시 모달입니다.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#5a3827] text-white py-2"
        >
          닫기
        </button>
      </div>
    </BaseModal>
  );
};

export default CenterModal;
