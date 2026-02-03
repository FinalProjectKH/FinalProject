import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaPlane, FaCalculator, FaTimes } from 'react-icons/fa';

export default function ApprovalModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const FORMS = [
    { 
      id: "general", 
      title: "기본 기안서", 
      desc: "일반적인 업무 보고 및 기안", 
      icon: <FaFileAlt className="text-blue-500 text-3xl" />, // 아이콘 크기 약간 키움
      type: "common"
    },
    { 
      id: "vacation", 
      title: "휴가 신청서", 
      desc: "연차, 반차, 병가 등 휴가 사용", 
      icon: <FaPlane className="text-green-500 text-3xl" />,
      type: "hr"
    },
    { 
      id: "expense", 
      title: "지출 결의서", 
      desc: "법인카드, 경비 지출 내역 결재", 
      icon: <FaCalculator className="text-orange-500 text-3xl" />,
      type: "accounting"
    }
  ];

  const handleSelectForm = (formId) => {
    navigate(`/approval/write/${formId}`);
    onClose();
  };

  return (
    // 배경 (Overlay)
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      
      {/* 모달 박스 */}
      <div className="bg-white z-200 rounded-lg shadow-2xl w-[500px] overflow-hidden animate-fade-in-up">
        
        {/* 1. 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">결재 양식 선택</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* 2. (검색창 있던 곳 삭제함) */}

        {/* 3. 양식 리스트 */}
        <div className="p-6 bg-white">
          <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
            추천 양식
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {FORMS.map((form) => (
              <button
                key={form.id}
                onClick={() => handleSelectForm(form.id)}
                className="flex items-center gap-5 p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all text-left group"
              >
                {/* 아이콘 박스 */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                  {form.icon}
                </div>
                
                {/* 텍스트 정보 */}
                <div>
                  <h3 className="font-bold text-gray-800 text-base group-hover:text-blue-700">
                    {form.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. 푸터 (닫기 버튼) */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}