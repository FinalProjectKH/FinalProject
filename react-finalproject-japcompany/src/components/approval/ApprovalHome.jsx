import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileSignature, FaListUl, FaCheckCircle, FaExclamationCircle, FaRegClock, FaArrowRight } from 'react-icons/fa';

export default function ApprovalHome() {
  const navigate = useNavigate();

  // 상태 관리
  const [data, setData] = useState({
    waitCount: 0,
    draftCount: 0,
    approveCount: 0,
    waitList: [],   // 결재 대기 (남의 거)
    draftList: []   // 내 기안 (내 거)
  });
  const [loading, setLoading] = useState(true);

  // 1. 데이터 로드 (내 정보 -> 홈 데이터)
  useEffect(() => {
    fetch('/employee/myInfo')
      .then(res => res.json())
      .then(member => {
        if (!member.empNo) return;
        
        // 내 사번으로 홈 데이터 조회
        return fetch(`/api/approval/home?empNo=${member.empNo}`);
      })
      .then(res => res && res.json())
      .then(result => {
        if (result) {
            setData(result);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("홈 데이터 로드 실패", err);
        setLoading(false);
      });
  }, []);

  // 날짜 포맷 (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString.substring(0, 10);
  };

  // 상태 뱃지
  const renderBadge = (status) => {
    if (status === 'W') return <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs border border-blue-100 font-bold">진행중</span>;
    if (status === 'C') return <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-100 font-bold">승인</span>;
    if (status === 'R') return <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs border border-red-100 font-bold">반려</span>;
    return <span>-</span>;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">대시보드 로딩중...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      
      {/* 1. 상단 타이틀 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <FaFileSignature className="text-blue-600"/> 전자결재 대시보드
        </h1>
        <p className="text-gray-500 text-sm mt-1">오늘 처리해야 할 업무를 한눈에 확인하세요.</p>
      </div>

      {/* 2. 상단 요약 카드 (클릭 시 해당함으로 이동) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 카드 1: 결재 대기 */}
        <div 
            onClick={() => navigate('/approval/wait')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-bold mb-1">결재 대기 문서</p>
                    <h3 className="text-4xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {data.waitCount} <span className="text-lg font-normal text-gray-400">건</span>
                    </h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                    <FaExclamationCircle size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
                바로가기 <FaArrowRight className="ml-1" />
            </div>
        </div>

        {/* 카드 2: 기안 진행 */}
        <div 
            onClick={() => navigate('/approval/draft')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-bold mb-1">진행 중인 내 기안</p>
                    <h3 className="text-4xl font-extrabold text-gray-800 group-hover:text-green-600 transition-colors">
                        {data.draftCount} <span className="text-lg font-normal text-gray-400">건</span>
                    </h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FaRegClock size={24} />
                </div>
            </div>
             <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
                바로가기 <FaArrowRight className="ml-1" />
            </div>
        </div>

        {/* 카드 3: 완료 문서 */}
        <div 
            onClick={() => navigate('/approval/approve')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-bold mb-1">오늘 완료된 문서</p>
                    <h3 className="text-4xl font-extrabold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {data.approveCount} <span className="text-lg font-normal text-gray-400">건</span>
                    </h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <FaCheckCircle size={24} />
                </div>
            </div>
             <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
                바로가기 <FaArrowRight className="ml-1" />
            </div>
        </div>
      </div>


      {/* 3. 하단 리스트 영역 (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 왼쪽: 결재 대기 리스트 (Top 5) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <FaExclamationCircle className="text-yellow-500"/> 결재 대기 (최신)
                </h3>
                <span onClick={() => navigate('/approval/wait')} className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 font-bold">더보기 +</span>
            </div>
            
            <div className="flex-1">
                {data.waitList && data.waitList.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-gray-100">
                            {data.waitList.map(doc => (
                                <tr key={doc.docNo} onClick={() => navigate(`/approval/detail/${doc.docNo}`)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{doc.approvalTitle}</div>
                                        <div className="text-xs text-gray-400 mt-1">{doc.empName} | {formatDate(doc.approvalDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 transition-colors">결재하기</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                        <FaCheckCircle size={30} className="mb-2 text-gray-200" />
                        결재할 문서가 없습니다.
                    </div>
                )}
            </div>
        </div>


        {/* 오른쪽: 내 기안 진행 리스트 (Top 5) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <FaListUl className="text-blue-500"/> 내 기안 진행 (최신)
                </h3>
                <span onClick={() => navigate('/approval/draft')} className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 font-bold">더보기 +</span>
            </div>
            
            <div className="flex-1">
                {data.draftList && data.draftList.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-gray-100">
                            {data.draftList.map(doc => (
                                <tr key={doc.docNo} onClick={() => navigate(`/approval/detail/${doc.docNo}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{doc.approvalTitle}</div>
                                        <div className="text-xs text-gray-400 mt-1">{formatDate(doc.approvalDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {renderBadge(doc.approvalStatus)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                        <FaListUl size={30} className="mb-2 text-gray-200" />
                        진행 중인 기안이 없습니다.
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}