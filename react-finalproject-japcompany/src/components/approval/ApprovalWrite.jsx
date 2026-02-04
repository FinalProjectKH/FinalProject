import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 아이콘 추가: FaExclamationTriangle (경고 아이콘)
import { FaTimes, FaSave, FaPaperPlane, FaPaperclip, FaExclamationTriangle } from 'react-icons/fa';
import ApprovalLineModal from './ApprovalLineModal';

// 🔥 분리된 양식 컴포넌트들
import GeneralForm from './forms/GeneralForm';
import VacationForm from './forms/VacationForm';
import ExpenseForm from './forms/ExpenseForm';

export default function ApprovalWrite() {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [showLineModal, setShowLineModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [approvalLines, setApprovalLines] = useState([]);

  // 1. 통합 데이터 관리 (모든 양식의 데이터를 여기서 관리)
  const [formData, setFormData] = useState({
    approvalTitle: '', 
    approvalContent: '',
    // 휴가용 데이터
    vacationType: '연차', startDate: '', endDate: '',
    // 지출용 데이터
    totalAmount: '', expenseDate: '', expenseReason: ''
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 결재선 핸들러
  const handleLineSave = (lines) => {
    setApprovalLines(lines);
    setFormData(prev => ({ ...prev, approvalLines: lines }));
  };

  // --- 모달 관련 핸들러 ---
  
  // 취소 버튼 클릭 시 모달 열기
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  // 모달에서 '나가기' 클릭 시 실제 이동
  const confirmCancel = () => {
    // 필요 시 폼 데이터 리셋 로직 추가
    navigate('/approval'); // 전자결재 홈으로 이동
  };

  // ... confirmCancel 함수 밑에 붙여넣으세요 ...

  // 🔥 [핵심] 서버로 데이터 전송하는 함수
  const handleSubmit = async () => {
    // 1. 유효성 검사 (결재선이 비어있으면 안 됨)
    if (approvalLines.length === 0) {
      alert("최소 1명 이상의 결재자를 지정해야 합니다.");
      return;
    }

    // 2. 서버로 보낼 데이터 포장하기 (DTO 구조에 맞춤)
    const payload = {
      empNo: "user1", // 임시: 현재 로그인한 사람 사번 (나중에 실제 로그인 정보로 교체)
      title: formData.approvalTitle,
      content: formData.approvalContent,
      retentionYear: 5, // 기본 5년 보존
      
      // 결재선 정리: 모달에서 받은 id를 서버가 아는 'approverNo'로 이름표 바꿔달기
      lines: approvalLines.map((line, idx) => ({
          approverNo: line.id, // 모달의 u1, u2 같은 ID
          seq: idx + 1         // 순서 1, 2, 3...
      })),
      
      // 상세 데이터는 일단 비워둠 (아래에서 채움)
      vacation: null,
      expense: null
    };

    // 3. 양식 종류(formId)에 따라 상세 내용 채우기
    if (formId === 'vacation') {
        payload.vacation = {
            vacationType: formData.vacationType, // 연차/반차 등
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalUse: 1.0 // 일수 계산 로직은 나중에 추가
        };
    } else if (formId === 'expense') {
        // 날짜에서 하이픈(-) 제거: 2026-02-04 -> 20260204
        const cleanDate = formData.expenseDate ? formData.expenseDate.replace(/-/g, '') : '';
        
        payload.expense = {
            expenseDate: cleanDate.substring(0, 6), // 202602 (년월만)
            totalAmount: Number(formData.amount),
            accountCode: 'ACC_001', // 회계 계정 코드 (일단 고정값)
            expenseReason: formData.content
        };
    }

    // 4. (중요) 실제 전송 전, 콘솔에 찍어서 눈으로 확인해보기
    console.log("🚀 서버로 날아가는 데이터:", JSON.stringify(payload, null, 2));

    // 5. 실제 전송 코드 (나중에 백엔드 주소 나오면 주석 풀기)
    /*
    try {
      const response = await fetch('/api/approval/regist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert("성공적으로 상신되었습니다!");
        navigate('/approval');
      }
    } catch (error) {
      console.error("에러 발생:", error);
      alert("전송 중 문제가 생겼습니다.");
    }
    */
    
    alert("콘솔(F12)을 켜서 데이터가 예쁘게 찍혔는지 확인해보세요!");
  };

  // 모달 닫기 (계속 작성)
  const closeModal = () => {
    setShowCancelModal(false);
  };

  // 2. 현재 양식에 맞는 컴포넌트 렌더링
  const renderFormComponent = () => {
    switch(formId) {
      case 'vacation': 
        return <VacationForm data={formData} onChange={handleChange} approvalLines={approvalLines}/>;
      case 'expense': 
        return <ExpenseForm data={formData} onChange={handleChange} approvalLines={approvalLines}/>;
      default: 
        return <GeneralForm data={formData} onChange={handleChange} approvalLines={approvalLines}/>;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 flex justify-center overflow-y-auto relative">
      
      {/* 종이 문서 컨테이너 (A4 느낌) */}
      <div className="bg-white w-[900px] shadow-xl border border-gray-300 flex flex-col min-h-[1100px] relative z-0">
        
        {/* === 1. 상단 툴바 (Sticky) === */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
           <div className="flex gap-2">
              <button 
                onClick={handleSubmit} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
              >
                <FaPaperPlane /> 결재요청
              </button>
              <button 
                onClick={() => alert("임시저장 기능은 구현 예정입니다.")}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FaSave /> 임시저장
              </button>
              <button 
                onClick={handleCancelClick} // 여기서 모달 트리거
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-sm font-medium text-gray-700"
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
           <div className="text-sm text-gray-500 font-medium">
             전자결재 &gt; 기안작성
           </div>
        </div>

        {/* === 2. 실제 양식 영역 === */}
        <div className="p-8 flex-1 flex justify-center">
          {renderFormComponent()}
        </div>

        {/* === 3. 하단 파일 첨부 영역 === */}
        <div className="px-10 pb-10">
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
             <div className="flex items-center gap-2 mb-3">
               <FaPaperclip className="text-gray-500" />
               <span className="text-sm font-bold text-gray-700">파일 첨부</span>
             </div>
             <div className="border border-dashed border-gray-300 bg-white rounded h-20 flex flex-col items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <p>파일을 마우스로 끌어 놓거나 여기를 클릭하세요.</p>
                <span className="text-xs text-gray-300 mt-1">(최대 50MB)</span>
             </div>
          </div>
        </div>

        {/* === 결재선 지정 모달 === */}
        <ApprovalLineModal 
          isOpen={showLineModal}
          onClose={() => setShowLineModal(false)}
          onConfirm={handleLineSave}
        />
        
      </div>

      {/* 🔥 [NEW] 커스텀 취소 확인 모달 (Overlay) 🔥 */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-96 border border-gray-200 transform transition-all scale-100">
            
            {/* 모달 헤더 */}
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <FaExclamationTriangle size={24} />
              <h3 className="text-lg font-bold text-gray-800">작성 취소</h3>
            </div>
            
            {/* 모달 내용 */}
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
              작성 중인 내용은 저장되지 않고 사라집니다.<br/>
              정말 목록으로 돌아가시겠습니까?
            </p>
            
            {/* 모달 버튼 액션 */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium transition-colors text-sm"
              >
                계속 작성하기
              </button>
              <button 
                onClick={confirmCancel}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-colors text-sm"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}