import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaEdit, FaTrash, FaPaperclip } from 'react-icons/fa';

import GeneralForm from './forms/GeneralForm';
import VacationForm from './forms/VacationForm';
import ExpenseForm from './forms/ExpenseForm';

// 성능 최적화 (폼 컴포넌트 메모이제이션)
const MemoizedGeneralForm = React.memo(GeneralForm);
const MemoizedVacationForm = React.memo(VacationForm);
const MemoizedExpenseForm = React.memo(ExpenseForm);

export default function ApprovalDetail() {
  const { docNo } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [myEmpNo, setMyEmpNo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 데이터 로드
  useEffect(() => {
    fetch('/employee/myInfo')
      .then(res => res.json())
      .then(member => setMyEmpNo(member.empNo))
      .catch(err => console.error(err));

    fetch(`/api/approval/detail/${docNo}`)
      .then(res => {
        if (!res.ok) throw new Error("문서를 찾을 수 없습니다.");
        return res.json();
      })
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        alert(err.message);
        navigate('/approval');
      });
  }, [docNo, navigate]);

  const handleProcess = (status) => {
    alert("승인/반려 기능 구현 필요");
  };

  const handleModify = () => {
    let formId = 'general';
    if (data.vacation) formId = 'vacation';
    if (data.expense) formId = 'expense';
    navigate(`/approval/write/${formId}`, { state: { docNo: docNo } });
  };

  const handleDelete = () => {
    if(window.confirm("정말 삭제하시겠습니까?")) {
        alert("삭제 기능 구현 필요");
    }
  };

  // 🔥 [추가] 파일 클릭 핸들러 (WebMvcConfig 설정에 따라 이미지/파일 열기)
  const handleFileDownload = (fileName) => {
    // 로컬 서버의 static 리소스 경로로 접근
    // 포트가 다를 경우 http://localhost:8080/uploads/... 로 명시해야 할 수도 있음
    const fileUrl = `/uploads/approval/${fileName}`;
    window.open(fileUrl, '_blank');
  };

  // 데이터 메모이제이션
  const formData = useMemo(() => {
    if (!data) return null;
    const { approval, lines, vacation, expense, expenseDetails } = data;
    
    return {
        docNo: approval.docNo,
        approvalTitle: approval.approvalTitle,
        approvalContent: approval.approvalContent,
        approvalDate: approval.approvalDate,
        
        approvalLineList: lines.map(line => ({
            approverNo: line.approverNo,
            name: line.empName,
            rank: line.jobName,
            appLineStatus: line.appLineStatus,
            appLineOrder: line.appLineOrder
        })),

        vacationType: vacation?.vacationType || '',
        startDate: vacation?.startDate || '',
        endDate: vacation?.endDate || '',
        totalAmount: expense?.totalAmount || 0,
        expenseDetailList: expenseDetails || [],
        
        approvalEmpName: approval.empName,
        approvalDeptName: approval.deptName
    };
  }, [data]);

  if (loading || !data) return <div className="text-center py-20">로딩중...</div>;

  const { approval, lines } = data;
  const isMyTurn = lines.some(line => line.approverNo === myEmpNo && line.appLineStatus === 'W');
  const isMyTemp = approval.empNo === myEmpNo && approval.tempSaveYn === 'Y';

  const renderForm = () => {
    const commonProps = {
      data: formData,
      onChange: () => {}, 
      readOnly: true,     
      approvalLines: formData.approvalLineList, 
      loginMember: { 
          empName: formData.approvalEmpName, 
          deptName: formData.approvalDeptName 
      } 
    };

    if (data.vacation) return <MemoizedVacationForm {...commonProps} />;
    if (data.expense) return <MemoizedExpenseForm {...commonProps} />;
    return <MemoizedGeneralForm {...commonProps} />;
  };

  return (
    // 전체 영역이 하나로 스크롤됨
    <div className="h-full overflow-y-auto bg-gray-100 p-8">
      
      <div className="max-w-[900px] mx-auto flex flex-col gap-6">
        
        {/* 1. 상단 툴바 */}
        <div className="bg-white px-6 py-4 rounded shadow-sm border border-gray-300 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors">
              <FaArrowLeft /> 목록으로
            </button>

            <div className="flex gap-2">
              {isMyTurn && (
                <>
                  <button onClick={() => handleProcess('C')} className="bg-blue-600 text-white px-4 py-2 rounded font-bold flex gap-2 items-center hover:bg-blue-700 shadow-sm transition-colors">
                    <FaCheck /> 승인
                  </button>
                  <button onClick={() => handleProcess('R')} className="bg-red-500 text-white px-4 py-2 rounded font-bold flex gap-2 items-center hover:bg-red-600 shadow-sm transition-colors">
                    <FaTimes /> 반려
                  </button>
                </>
              )}

              {isMyTemp && (
                <>
                  <button onClick={handleModify} className="bg-green-600 text-white px-4 py-2 rounded font-bold flex gap-2 items-center hover:bg-green-700 shadow-sm transition-colors">
                    <FaEdit /> 수정하기
                  </button>
                  <button onClick={handleDelete} className="bg-gray-500 text-white px-4 py-2 rounded font-bold flex gap-2 items-center hover:bg-gray-600 shadow-sm transition-colors">
                    <FaTrash /> 삭제
                  </button>
                </>
              )}
            </div>
        </div>

        {/* 2. 기안용지 (본문) */}
        <div className="bg-white shadow-xl border border-gray-300 min-h-[1100px] transform-gpu">
            <div className="p-12">
                {renderForm()}

                {/* 첨부파일 영역 */}
                <div className="mt-10 p-5 bg-gray-50 rounded border border-gray-200 w-full mx-auto">
                    <div className="flex items-center gap-2 mb-3">
                        <FaPaperclip className="text-gray-500" />
                        <span className="text-sm font-bold text-gray-700">첨부파일</span>
                    </div>

                    {approval && approval.approvalFile ? (
                        /* 🔥 파일명 클릭 시 다운로드/열기 */
                        <div 
                            onClick={() => handleFileDownload(approval.approvalFile)}
                            className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-blue-800 hover:underline bg-white p-2 border border-gray-100 rounded shadow-sm transition-all w-fit"
                        >
                            <FaPaperclip className="text-xs" />
                            <span>{approval.approvalFile}</span>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm pl-6">첨부된 파일이 없습니다.</div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}