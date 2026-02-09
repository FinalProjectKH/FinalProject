import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import { FaTimes, FaSave, FaPaperPlane, FaPaperclip, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

import ApprovalLineModal from './ApprovalLineModal';
import GeneralForm from './forms/GeneralForm';
import VacationForm from './forms/VacationForm';
import ExpenseForm from './forms/ExpenseForm';

export default function ApprovalWrite() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // 수정 모드일 경우 전달받은 docNo (없으면 undefined)
  const editDocNo = location.state?.docNo;

  // 상태 관리
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);
  const [loginMember, setLoginMember] = useState(null);

  // 파일 관리 상태 & Ref
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const fileInputRef = useRef(null); 

  // 폼 데이터 초기값
  const initialFormData = {
    approvalTitle: '', 
    approvalContent: '',
    approvalLineList: [],
    expenseDetailList: [],
    totalAmount: 0,
    vacationType: '연차', 
    startDate: '', 
    endDate: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  // 1. 내 정보 가져오기
  useEffect(() => {
    fetch("/employee/myInfo", { 
        method: "GET",
        credentials: "include", 
    })
    .then(res => {
        if(res.status === 401) {
            alert("로그인 세션이 만료되었습니다.");
            navigate('/'); 
            return null;
        }
        return res.json();
    })
    .then(data => setLoginMember(data))
    .catch(err => console.error(err));
  }, []);

  // 2. 탭 변경 시 초기화 (수정 모드가 아닐 때만)
  useEffect(() => {
    if (!editDocNo) {
        setFormData(initialFormData);
        setSelectedFiles([]); 
    }
  }, [formId, editDocNo]);


  // 3. 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (editDocNo) {
      fetch(`/api/approval/detail/${editDocNo}`)
        .then(res => {
            if (!res.ok) throw new Error("데이터 로드 실패");
            return res.json();
        })
        .then(data => {
            setFormData({
                approvalTitle: data.approval.approvalTitle,
                approvalContent: data.approval.approvalContent,
                
                approvalLineList: data.lines.map(line => ({
                    approverNo: line.approverNo,
                    name: line.empName,
                    rank: line.jobName, 
                    dept: '', 
                    appLineOrder: line.appLineOrder,
                    appLineStatus: line.appLineStatus
                })),

                vacationType: data.vacation?.vacationType || '연차',
                startDate: data.vacation?.startDate || '',
                endDate: data.vacation?.endDate || '',

                totalAmount: data.expense?.totalAmount || 0,
                expenseDetailList: data.expenseDetails || []
            });
            // (참고: 기존 파일 목록 처리는 생략됨)
        })
        .catch(err => {
            console.error(err);
            alert("임시저장 데이터를 불러오는데 실패했습니다.");
        });
    }
  }, [editDocNo]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineSave = (lines) => {
    const formattedLines = lines.map((approver, index) => ({
       approverNo: approver.id,
       name: approver.name,
       rank: approver.rank,
       dept: approver.dept,
       appLineOrder: index + 1,
       appLineStatus: "W"
    }));
    setFormData(prev => ({ ...prev, approvalLineList: formattedLines }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        setSelectedFiles([files[0]]); 
    }
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleFileBoxClick = () => {
    fileInputRef.current.click();
  };


  // 🔥 [핵심 수정] 통합 제출 핸들러
  const handleSubmit = async (isTemp) => {
    if (!loginMember) return; 
    
    if (!formData.approvalTitle) { 
        alert("제목을 입력해주세요."); 
        return; 
    }

    if (!isTemp) {
        if (!formData.approvalContent) { alert("내용을 입력해주세요."); return; }
        if (formId === 'expense' && formData.totalAmount <= 0) { alert("지출 내역을 작성해주세요."); return; }
        if (!formData.approvalLineList || formData.approvalLineList.length === 0) { alert("결재선을 지정해주세요."); return; }
    }

    const requestData = {
      // 🔥 수정일 땐 문서번호가 있고, 신규일 땐 null (백엔드에서 이거 보고 판단함)
      docNo: editDocNo || null, 
      empNo: loginMember.empNo, 
      approvalTitle: formData.approvalTitle,
      approvalContent: formData.approvalContent,
      retentionYear: 5,                
      approvalLineList: formData.approvalLineList,
      totalAmount: formId === 'expense' ? formData.totalAmount : 0,
      expenseDetailList: formId === 'expense' ? formData.expenseDetailList : [],
      vacationType: formId === 'vacation' ? formData.vacationType : null,
      startDate: formId === 'vacation' ? formData.startDate : null,
      endDate: formId === 'vacation' ? formData.endDate : null,
      totalUse: 0,
      tempSaveYn: isTemp ? "Y" : "N"
    };

    const sendFormData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(requestData)], { type: "application/json" });
    sendFormData.append("data", jsonBlob);

    selectedFiles.forEach(file => {
      sendFormData.append("files", file);
    });

    try {
      // 🔥 [핵심] 무조건 /insert로 통일 (백엔드가 docNo 유무로 Insert/Update 판단)
      const response = await fetch("/api/approval/insert", {
        method: "POST",
        body: sendFormData, 
      });

      if (response.ok) {
        alert(isTemp ? "임시 저장되었습니다." : "성공적으로 상신되었습니다.");
        // 상신이면 대기함, 임시저장이면 임시함으로 이동
        navigate(isTemp ? '/approval/temp' : '/approval/wait'); 
      } else {
        const errorMsg = await response.text();
        alert((isTemp ? "저장 실패: " : "상신 실패: ") + errorMsg);
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류 발생");
    }
  };

  const handleCancelClick = () => setShowCancelModal(true);
  const closeModal = () => setShowCancelModal(false);
  const confirmCancel = () => navigate('/approval'); 

  if (!loginMember) return <div className="flex justify-center items-center h-screen">로딩중...</div>;

  const renderFormComponent = () => {
    const commonProps = {
        data: formData,
        onChange: handleChange,
        approvalLines: formData.approvalLineList,
        loginMember: loginMember 
    };
    switch(formId) {
      case 'vacation': return <VacationForm {...commonProps} />;
      case 'expense':  return <ExpenseForm {...commonProps} />;
      default:         return <GeneralForm {...commonProps} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 flex justify-center overflow-y-auto relative">
      <div className="bg-white w-[900px] shadow-xl border border-gray-300 flex flex-col min-h-[1100px] relative z-0">
        
        {/* 상단 툴바 */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
           <div className="flex gap-2">
              <button 
                onClick={() => handleSubmit(false)} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
              >
                <FaPaperPlane /> {editDocNo ? "수정 상신" : "결재요청"}
              </button>
              
              <button 
                onClick={() => handleSubmit(true)} 
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FaSave /> 임시저장
              </button>
              
              <button onClick={handleCancelClick} className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-sm font-medium text-gray-700">
                <FaTimes /> 취소
              </button>
              <button onClick={() => setShowLineModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <FaPaperclip /> 결재선 지정
              </button>
           </div>
           <div className="text-sm text-gray-500 font-medium">
                전자결재 &gt; {editDocNo ? "문서 수정" : "기안작성"}
           </div>
        </div>

        {/* 양식 영역 */}
        <div className="p-8 flex-1 flex justify-center">
          {renderFormComponent()}
        </div>
        
        {/* 파일 첨부 영역 */}
         <div className="px-10 pb-10">
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
             <div className="flex items-center gap-2 mb-3">
               <FaPaperclip className="text-gray-500" />
               <span className="text-sm font-bold text-gray-700">파일 첨부</span>
             </div>
             
             <div 
                onClick={handleFileBoxClick}
                className="border border-dashed border-gray-300 bg-white rounded h-20 flex flex-col items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
             >
                <p>파일을 마우스로 끌어 놓거나 여기를 클릭하세요.</p>
                <span className="text-xs text-gray-300 mt-1">(최대 50MB)</span>
             </div>

             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept=".jpg,.jpeg,.png,.gif,.pdf,.hwp,.xlsx,.xls,.docx,.doc,.ppt,.pptx"
             />

             {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                   {selectedFiles.map((file, index) => (
                      <div key={index} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                             <FaPaperclip className="text-gray-400" />
                             <span>{file.name}</span>
                             <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                             <FaTrash />
                          </button>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>

      </div>

      {/* 모달들 */}
      {showCancelModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <div className="bg-white rounded-lg shadow-2xl p-6 w-96 border border-gray-200 transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <FaExclamationTriangle size={24} />
              <h3 className="text-lg font-bold text-gray-800">작성 취소</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">작성 중인 내용은 저장되지 않습니다.<br/>나가시겠습니까?</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium transition-colors text-sm">계속 작성하기</button>
              <button onClick={confirmCancel} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-colors text-sm">나가기</button>
            </div>
          </div>
        </div>
      )}

      <ApprovalLineModal 
        isOpen={showLineModal} 
        onClose={() => setShowLineModal(false)} 
        onConfirm={handleLineSave} 
        drafter={loginMember}
      />
    </div>
  );
}