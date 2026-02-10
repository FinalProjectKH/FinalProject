import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ApprovalDocList() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [docList, setDocList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empNo, setEmpNo] = useState(null);

  // 1. URL 경로를 보고 어떤 API를 호출할지 결정
  const getApiEndpoint = (path) => {
    if (path.includes('/wait')) return 'wait';
    if (path.includes('/upcoming')) return 'upcoming';
    if (path.includes('/draft')) return 'draft';
    if (path.includes('/temp')) return 'temp';
    if (path.includes('/approve')) return 'approved'; // URL이 /approve로 끝나는 경우
    return 'wait';
  };

  // 2. 내 정보(사번) 가져오기
  useEffect(() => {
    fetch('/employee/myInfo')
      .then(res => res.json())
      .then(member => {
        if (member && member.empNo) setEmpNo(member.empNo);
      })
      .catch(err => console.error(err));
  }, []);

  // 3. 데이터 조회 (URL이 바뀌거나 사번을 가져오면 실행)
  useEffect(() => {
    if (!empNo) return;

    setLoading(true);
    const apiType = getApiEndpoint(location.pathname);

    fetch(`/api/approval/${apiType}?empNo=${empNo}`)
      .then(res => {
        if (!res.ok) throw new Error('조회 실패');
        return res.json();
      })
      .then(data => {
        setDocList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDocList([]);
        setLoading(false);
      });
  }, [location.pathname, empNo]); // 👈 URL이 바뀔 때마다 여기서 감지해서 데이터를 다시 긁어옵니다.

  // 뱃지 스타일
  const getStatusBadge = (status) => {
    switch(status) {
      case 'W': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">대기</span>;
      case 'I': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">진행</span>;
      case 'C': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">승인</span>;
      case 'R': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">반려</span>;
      default: return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="bg-gray-50 text-gray-700 uppercase border-b">
          <tr>
            <th className="px-6 py-3 w-32">문서번호</th>
            <th className="px-6 py-3">제목</th>
            <th className="px-6 py-3 w-32">기안일</th>
            {/* 기안/임시함이 아닐 때만 기안자 표시 */}
            {!location.pathname.includes('draft') && !location.pathname.includes('temp') && (
               <th className="px-6 py-3 w-24">기안자</th>
            )}
            <th className="px-6 py-3 w-24">상태</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="text-center py-20">데이터를 불러오는 중...</td></tr>
          ) : docList.length === 0 ? (
            <tr><td colSpan="5" className="text-center py-20">문서가 없습니다.</td></tr>
          ) : (
            docList.map((doc) => (
              <tr 
                key={doc.docNo} 
                onClick={() => navigate(`/approval/detail/${doc.docNo}`)}
                className="bg-white border-b hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-mono">{doc.docNo}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                    {doc.approvalTitle}
                    {doc.tempSaveYn === 'Y' && <span className="text-red-500 text-xs ml-2 font-bold">[임시]</span>}
                </td>
                <td className="px-6 py-4">{doc.approvalDate || '-'}</td>
                
                {!location.pathname.includes('draft') && !location.pathname.includes('temp') && (
                    <td className="px-6 py-4">{doc.empName || '나'}</td>
                )}
                
                <td className="px-6 py-4">{getStatusBadge(doc.approvalStatus)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}