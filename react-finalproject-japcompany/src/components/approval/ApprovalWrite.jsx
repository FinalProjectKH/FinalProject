import React, { useState, useEffect, useRef } from 'react';
// 🔥 useSearchParams 추가!
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'; 
import { FaTimes, FaSave, FaPaperPlane, FaPaperclip, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

import ApprovalLineModal from './ApprovalLineModal';
import GeneralForm from './forms/GeneralForm';
import VacationForm from './forms/VacationForm';
import ExpenseForm from './forms/ExpenseForm';

export default function ApprovalWrite() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // 🔥 주소창 파라미터 읽기 기능

  // 🔥 [핵심 수정] state에도 없고, 주소창(searchParams)에도 없으면 undefined
  const editDocNo = location.state?.docNo || searchParams.get('docNo');

  // 상태 관리
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);
  const [loginMember, setLoginMember] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState([]); 
  const fileInputRef = useRef(null); 

  const initialFormData = {
    docNo: '', 
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
    fetch("/employee/myInfo", { method: "GET" })
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

  // 2. 초기화 (신규 작성일 때만)
  useEffect(() => {
    if (!editDocNo) {
        setFormData(initialFormData);
        setSelectedFiles([]); 
    }
  }, [formId, editDocNo]);


  // 3. 🔥 [데이터 로드] 수정 모드일 때
  useEffect(() => {
    if (editDocNo && loginMember?.empNo) {
      console.log("데이터 로드 시작: ", editDocNo);

      fetch(`/api/approval/view/${editDocNo}?empNo=${loginMember.empNo}`)
        .then(res => {
            if (!res.ok) throw new Error("데이터 로드 실패");
            return res.json();
        })
        .then(result => {
            console.log("백엔드 응답:", result);
            
            // 🔥 Map 구조 해체 (JSON 구조에 맞춤)
            const { approval, lines, vacation, expense, expenseDetails } = result;

            if (!approval) return;

            setFormData({
                docNo: approval.docNo,
                approvalTitle: approval.approvalTitle || '', 
                approvalContent: approval.approvalContent || '',
                
                // 결재선
                approvalLineList: lines ? lines.map(line => ({
                    approverNo: line.approverNo,
                    name: line.empName,
                    rank: line.positionName || line.jobName, 
                    dept: line.deptName || '', 
                    appLineOrder: line.appLineOrder,
                    appLineStatus: line.appLineStatus
                })) : [],

                // 휴가
                vacationType: vacation?.vacationType || approval.vacationType || '연차',
                startDate: vacation?.startDate || approval.startDate || '',
                endDate: vacation?.endDate || approval.endDate || '',

                // 지출
                totalAmount: expense?.totalAmount || approval.totalAmount || 0,
                expenseDetailList: expenseDetails || []
            });
        })
        .catch(err => {
            console.error(err);
        });
    }
  }, [editDocNo, loginMember]);


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
    if (files.length > 0) setSelectedFiles([files[0]]); 
    e.target.value = '';
  };

  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  const handleFileBoxClick = () => fileInputRef.current.click();

  const handleSubmit = async (isTemp) => {
    if (!loginMember) return; 
    
    if (!formData.approvalTitle) { alert("제목을 입력해주세요."); return; }

    if (!isTemp) {
        if (!formData.approvalContent) { alert("내용을 입력해주세요."); return; }
        if (formId === 'expense' && formData.totalAmount <= 0) { alert("지출 내역을 작성해주세요."); return; }
        if (!formData.approvalLineList || formData.approvalLineList.length === 0) { alert("결재선을 지정해주세요."); return; }
    }

    const requestData = {
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
    selectedFiles.forEach(file => sendFormData.append("files", file));

    try {
      const response = await fetch("/api/approval/insert", { method: "POST", body: sendFormData });
      if (response.ok) {
        alert(isTemp ? "임시 저장되었습니다." : "성공적으로 상신되었습니다.");
        navigate(isTemp ? '/approval/temp' : '/approval/wait'); 
      } else {
        const msg = await response.text();
        alert((isTemp ? "저장 실패: " : "상신 실패: ") + msg);
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
        loginMember: loginMember,
        readOnly: false,
        // 🔥 [핵심] 키를 부여하여 데이터가 로드되면 폼을 강제로 다시 그리게 함 (ExpenseForm 버그 방지)
        key: formData.docNo || "init" 
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
              <button onClick={() => handleSubmit(false)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm text-sm font-medium">
                <FaPaperPlane /> {editDocNo ? "수정 상신" : "결재요청"}
              </button>
              <button onClick={() => handleSubmit(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 text-sm font-medium text-gray-700">
                <FaSave /> 임시저장
              </button>
              <button onClick={handleCancelClick} className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-red-50 text-red-600 text-sm font-medium">
                <FaTimes /> 취소
              </button>
              <button onClick={() => setShowLineModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 text-sm font-medium text-gray-700">
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
             <div onClick={handleFileBoxClick} className="border border-dashed border-gray-300 bg-white rounded h-20 flex flex-col items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-blue-50 transition-colors">
                <p>파일을 마우스로 끌어 놓거나 여기를 클릭하세요.</p>
                <span className="text-xs text-gray-300 mt-1">(최대 50MB)</span>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.gif,.pdf,.hwp,.xlsx,.xls,.docx,.doc,.ppt,.pptx" />
             {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                   {selectedFiles.map((file, index) => (
                      <div key={index} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded text-sm">
                          <div className="flex items-center gap-2 text-gray-700"><FaPaperclip className="text-gray-400" /><span>{file.name}</span></div>
                          <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500"><FaTrash /></button>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>
      </div>

      {showCancelModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <div className="bg-white rounded-lg shadow-2xl p-6 w-96 border border-gray-200">
            <div className="flex items-center gap-3 mb-4 text-amber-500"><FaExclamationTriangle size={24} /><h3 className="text-lg font-bold">작성 취소</h3></div>
            <p className="text-gray-600 mb-6 text-sm">작성 중인 내용은 저장되지 않습니다.<br/>나가시겠습니까?</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 text-sm">계속 작성하기</button>
              <button onClick={confirmCancel} className="px-4 py-2 rounded bg-red-500 text-white text-sm">나가기</button>
            </div>
          </div>
        </div>
      )}

      <ApprovalLineModal isOpen={showLineModal} onClose={() => setShowLineModal(false)} onConfirm={handleLineSave} drafter={loginMember} />
    </div>
  );
}