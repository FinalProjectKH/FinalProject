import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes, FaSave, FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import ApprovalLineModal from './ApprovalLineModal';

// 🔥 분리된 양식 컴포넌트들 (이제 이 안에 테이블+결재선이 다 들어있음)
import GeneralForm from './forms/GeneralForm';
import VacationForm from './forms/VacationForm';
import ExpenseForm from './forms/ExpenseForm';

export default function ApprovalWrite() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [showLineModal, setShowLineModal] = useState(false);
  const [approvalLines, setApprovalLines]= useState([]);

  // 1. 통합 데이터 관리 (모든 양식의 데이터를 여기서 쥐고 있음)
  const [formData, setFormData] = useState({
    title: '', 
    content: '',
    // 휴가용 데이터
    vacationType: '연차', startDate: '', endDate: '',
    // 지출용 데이터
    amount: '', expenseDate: '', payee: ''
  });

  // 입력값 변경 핸들러 (자식에게 내려줄 함수)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 결재선 핸들러
  const handleLineSave = (lines) => {
    setApprovalLines(lines);
  }

  // 2. 현재 양식에 맞는 컴포넌트 선택
  const renderFormComponent = () => {
    switch(formId) {
      case 'vacation': 
        // return <VacationForm data={formData} onChange={handleChange} />;
        return <VacationForm data={formData} onChange={handleChange} />;
      case 'expense': 
        // return <ExpenseForm data={formData} onChange={handleChange} />;
        return <ExpenseForm data={formData} onChange={handleChange} />;
      default: 
        // 기본 기안서 
        return <GeneralForm data={formData} onChange={handleChange} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 flex justify-center overflow-y-auto">
      
      {/* 종이 문서 컨테이너 (A4 느낌) */}
      <div className="bg-white w-[900px] shadow-xl border border-gray-300 flex flex-col min-h-[1100px]">
        
        {/* === 1. 상단 툴바 (고정) === */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-19">
           <div className="flex gap-2">
              <button 
                onClick={() => alert(JSON.stringify(formData))} // 테스트용
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
              >
                <FaPaperPlane /> 결재요청
              </button>
              <button 
              onClick={() => alert("임시저장~!!!")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FaSave /> 임시저장
              </button>
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FaTimes /> 취소
              </button>
                            <button 
                onClick={() => setShowLineModal(true)} 
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FaPaperclip /> 결재선 지정
              </button>
           </div>
           <div className="text-sm text-gray-500">
             전자결재 &gt; 기안작성
           </div>
        </div>

        {/* === 2. 실제 양식 영역 (알맹이) === */}
        <div className="p-8 flex-1 flex justify-center">
          {/* 여기서 GeneralForm이 렌더링됩니다.
              GeneralForm 안에 <table width="800px">가 있으므로 
              부모 div는 flex justify-center로 중앙 정렬만 해주면 됩니다.
          */}
          {renderFormComponent()}
        </div>

        {/* === 3. 하단 파일 첨부 영역 (공통) === */}
        <div className="px-10 pb-10">
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
             <div className="flex items-center gap-2 mb-3">
               <FaPaperclip className="text-gray-500" />
               <span className="text-sm font-bold text-gray-700">파일 첨부</span>
             </div>
             <div className="border border-dashed border-gray-300 bg-white rounded h-20 flex flex-col items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <p>파일을 마우스로 끌어 놓으거나 여기를 클릭하세요.</p>
                <span className="text-xs text-gray-300 mt-1">(최대 50MB)</span>
             </div>
          </div>
        </div>

        <ApprovalLineModal 
          isOpen={showLineModal}
          onClose={() => setShowLineModal(false)}
          onConfirm={handleLineSave}
        />
      </div>
    </div>
  );
}