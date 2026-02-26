import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaEdit, FaTrash, FaPaperclip, FaTimesCircle } from 'react-icons/fa';

import GeneralForm from './forms/GeneralForm';
import VacationForm from './forms/VacationForm';
import ExpenseForm from './forms/ExpenseForm';

const MemoizedGeneralForm = React.memo(GeneralForm);
const MemoizedVacationForm = React.memo(VacationForm);
const MemoizedExpenseForm = React.memo(ExpenseForm);

export default function ApprovalDetail() {
  const { docNo } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [myEmpNo, setMyEmpNo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // 🔥 VITE 환경 변수 가져오기
  const API_URL = import.meta.env.VITE_BASE_URL;

  // 1. 내 정보 로드
  useEffect(() => {
    fetch(`${API_URL}/employee/myInfo`, { credentials: 'include' })
      .then(res => res.json())
      .then(member => {
          setMyEmpNo(member.empNo);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. 데이터 로드
  useEffect(() => {
    if (!docNo || !myEmpNo) return; 

    fetch(`${API_URL}/api/approval/view/${docNo}?empNo=${myEmpNo}`, { credentials: 'include' }) 
      .then(res => {
        if (res.status === 403) throw new Error("조회 권한이 없습니다.");
        if (res.status === 400) throw new Error("잘못된 요청입니다. (사번 누락)");
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
  }, [docNo, myEmpNo, navigate]); 

  // 폼 데이터 가공
  const formData = useMemo(() => {
    if (!data || !data.approval) return null;

    const { approval, lines, vacation, expense, expenseDetails } = data;
    
    return {
        docNo: approval.docNo,
        approvalTitle: approval.approvalTitle,
        approvalContent: approval.approvalContent,
        approvalDate: approval.approvalDate,
        approvalLineList: lines ? lines.map(line => ({
            approverNo: line.approverNo,
            name: line.empName,
            rank: line.deptName, 
            jobName: line.jobName, 
            appLineStatus: line.appLineStatus,
            appLineOrder: line.appLineOrder
        })) : [],
        vacationType: vacation?.vacationType || '',
        startDate: vacation?.startDate || '',
        endDate: vacation?.endDate || '',
        totalAmount: expense?.totalAmount || 0,
        expenseDetailList: expenseDetails || [],
        approvalEmpName: approval.empName,
        approvalDeptName: approval.deptName
    };
  }, [data]);

  // 내 차례 판별 로직
  const isMyTurn = useMemo(() => {
      if (!data || !myEmpNo || !data.lines) return false;
      const { lines } = data;

      const myLine = lines.find(line => String(line.approverNo) === String(myEmpNo));
      if (!myLine || myLine.appLineStatus !== 'W') return false;

      const hasPreviousWaiter = lines
          .filter(line => line.appLineOrder < myLine.appLineOrder)
          .some(prevLine => prevLine.appLineStatus === 'W');

      return !hasPreviousWaiter;
  }, [data, myEmpNo]);

  // 회수 가능 여부
  const canRetract = useMemo(() => {
      if (!data || !myEmpNo || !data.approval || !data.lines) return false;
      const { approval, lines } = data;
      
      return String(approval.empNo) === String(myEmpNo) && 
             approval.approvalStatus === 'W' && 
             approval.tempSaveYn === 'N' &&
             lines.length > 0 &&
             lines[0].appLineStatus === 'W';
  }, [data, myEmpNo]);

  // 임시저장 여부
  const isMyTemp = useMemo(() => {
      if (!data || !myEmpNo || !data.approval) return false;
      return String(data.approval.empNo) === String(myEmpNo) && data.approval.tempSaveYn === 'Y';
  }, [data, myEmpNo]);

  if (loading || !data || !data.approval) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-xl font-bold text-gray-500 animate-pulse">
                문서 정보를 불러오는 중입니다...
            </div>
        </div>
      );
  }

  const { approval } = data; 

  // ---------------- 핸들러 함수들 ----------------

  const handleProcess = async (status, reason = null) => {
    if (status === 'R' && reason === null) {
        setRejectReason(""); 
        setShowRejectModal(true);
        return;
    }

    const actionName = status === 'C' ? '승인' : '반려';
    if (status === 'C' && !window.confirm(`정말 ${actionName} 하시겠습니까?`)) return;

    try {
        const response = await fetch(`${API_URL}/api/approval/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include', // 🔥 추가됨
            body: JSON.stringify({
                docNo: docNo,
                status: status,
                empNo: myEmpNo,
                rejectReason: reason 
            }),
        });

        if (response.ok) {
            alert(`${actionName} 처리가 완료되었습니다.`);
            setShowRejectModal(false); 
            navigate('/approval');
        } else {
            const msg = await response.text();
            alert(`처리 실패: ${msg}`);
        }
    } catch (error) {
        console.error(error);
        alert("서버 통신 오류");
    }
  };

  const submitReject = () => {
      if (!rejectReason.trim()) {
          alert("반려 사유를 입력해주세요.");
          return;
      }
      handleProcess('R', rejectReason);
  };

  const handleModify = () => {
    let formId = 'general';
    if (data.vacation) formId = 'vacation';
    if (data.expense) formId = 'expense';
    navigate(`/approval/write/${formId}?docNo=${docNo}`); 
  };

  const handleDelete = async () => {
    if(!window.confirm("정말 삭제하시겠습니까? (삭제 후 복구할 수 없습니다)")) return;
    try {
        const response = await fetch(`${API_URL}/api/approval/delete/${docNo}`, { 
            method: "DELETE",
            credentials: 'include' // 🔥 추가됨
        });
        if (response.ok) {
            alert("삭제되었습니다.");
            navigate('/approval');
        } else {
            const msg = await response.text();
            alert(`삭제 실패: ${msg}`);
        }
    } catch (error) {
        console.error(error);
        alert("서버 통신 오류");
    }
  };

  const handleCancel = async () => {
    if(!window.confirm("결재 요청을 회수하시겠습니까?\n(문서는 임시저장 보관함으로 이동합니다.)")) return;
    try {
      const response = await fetch(`${API_URL}/api/approval/cancel`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        credentials: 'include', // 🔥 추가됨
        body: JSON.stringify({ docNo: docNo, empNo: myEmpNo }),
      });

      if (response.ok) {
          alert("문서가 회수되었습니다.\n임시저장함에서 다시 수정할 수 있습니다.");
          navigate('/approval/temp');
      } else {
          const msg = await response.text();
          alert(`회수 실패: ${msg}`);
      }
    } catch (error) {
      console.error(error);
      alert("서버오류 발생");
    }
  };

  const handleFileDownload = (fileName) => {
    // 🔥 백엔드 서버 주소에서 파일을 다운로드 받도록 수정됨!
    const fileUrl = `${API_URL}/uploads/approval/${fileName}`;
    window.open(fileUrl, '_blank');
  };

  const renderForm = () => {
    if (!formData) return null; 

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
    <div className="h-full overflow-y-auto bg-gray-100 p-8">
      <div className="max-w-[900px] mx-auto flex flex-col gap-6">
        
        {/* 상단 툴바 */}
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
              
              {canRetract && (
                  <button onClick={handleCancel} className="bg-orange-500 text-white px-4 py-2 rounded font-bold flex gap-2 items-center hover:bg-orange-600 shadow-sm transition-colors">
                      <FaTimes /> 상신취소
                  </button>
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

      {/* 반려 사유 표시 영역 */}
      {data && data.approval.approvalStatus === 'R' && (
        <div className="w-full max-w-[900px] mx-auto mb-8">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 shadow-sm flex items-start gap-4">
            <div className="text-red-500 mt-1">
              <FaTimesCircle size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-1">
                이 문서는 반려되었습니다.
              </h3>
              <div className="text-sm text-red-700 mb-3">
                결재자 <span className="font-bold underline">
                    {data.lines ? data.lines.find(line => line.appLineStatus === 'R')?.empName : '알 수 없음'}
                </span> 님의 의견:
              </div>
              <div className="bg-white border border-red-200 rounded p-4 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                {data.lines ? data.lines.find(line => line.appLineStatus === 'R')?.rejectReason : "사유가 입력되지 않았습니다."}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* 기안용지 (본문) */}
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
      
      {/* 반려 사유 입력 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-[500px] p-6 border border-gray-200 animate-fadeIn">
            
            <div className="flex items-center gap-2 mb-4 text-red-600 border-b pb-2">
              <FaTimes size={24} />
              <h3 className="text-xl font-bold">결재 반려</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2 text-sm">반려 사유를 입력하시면 기안자에게 전달됩니다.</p>
              <textarea
                className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none h-32"
                placeholder="예: 예산 초과, 증빙 서류 미비 등 구체적인 사유를 입력하세요."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded text-gray-500 hover:bg-gray-100 font-medium transition-colors border border-gray-300"
              >
                취소
              </button>
              <button 
                onClick={submitReject}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transition-colors"
              >
                반려 확정
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}