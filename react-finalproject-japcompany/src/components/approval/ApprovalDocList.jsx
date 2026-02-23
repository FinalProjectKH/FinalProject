import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination'; 

export default function ApprovalDocList() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [docList, setDocList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empNo, setEmpNo] = useState(null);

  // 페이징 관련 상태
  const [page, setPage] = useState(1);       // 현재 페이지
  const [pagination, setPagination] = useState(null); // 페이징 메타데이터

  // 🔥 VITE 환경 변수 가져오기
  const API_URL = import.meta.env.VITE_BASE_URL;

  // 1. 현재 페이지 상태 체크
  const isApproveBox = location.pathname.includes('/approve'); 
  const isDraftOrTemp = location.pathname.includes('draft') || location.pathname.includes('temp'); 

  // 2. 동적 컬럼 개수 계산
  let colCount = 4; // 기본: 번호, 제목, 기안일, 상태
  if (isApproveBox) colCount += 1; // 결재일
  if (!isDraftOrTemp) colCount += 1; // 기안자

  // API 엔드포인트 결정
  const getApiEndpoint = (path) => {
    if (path.includes('/wait')) return 'wait';
    if (path.includes('/upcoming')) return 'upcoming';
    if (path.includes('/draft')) return 'draft';
    if (path.includes('/temp')) return 'temp';
    if (path.includes('/approve')) return 'approved'; 
    return 'wait';
  };

  // 내 정보 가져오기
  useEffect(() => {
    // 🔥 백엔드 주소 및 credentials 설정 추가
    fetch(`${API_URL}/employee/myInfo`, { credentials: 'include' })
      .then(res => res.json())
      .then(member => {
        if (member && member.empNo) setEmpNo(member.empNo);
      })
      .catch(err => console.error(err));
  }, []);

  //  메뉴(탭)가 바뀌면 페이지를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [location.pathname]);

  // 데이터 조회
  useEffect(() => {
    if (!empNo) return;

    setLoading(true);
    const apiType = getApiEndpoint(location.pathname);

    // 🔥 백엔드 주소 및 credentials 설정 추가
    fetch(`${API_URL}/api/approval/${apiType}?empNo=${empNo}&page=${page}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('조회 실패');
        return res.json();
      })
      .then(data => {
        if (data) {
            setDocList(data.list || []); 
            setPagination(data.pagination || null);
        } else {
            setDocList([]);
            setPagination(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDocList([]);
        setLoading(false);
      });
  }, [location.pathname, empNo, page]); 

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

  // 문서번호 포맷팅
  const renderDocNo = (docNo) => {
    if (!docNo) return '-';
    const parts = docNo.split('-');
    if (parts.length === 2) {
      return (
        <div className="flex flex-col items-center leading-tight">
          <span className="font-bold text-gray-600">{parts[0]}-</span>
          <span className="text-gray-400">{parts[1]}</span>
        </div>
      );
    }
    return docNo;
  };

  return (
    <div className="flex flex-col gap-4"> 
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        <table className="w-full text-sm text-left text-gray-500 table-fixed">
            <thead className="bg-gray-50 text-gray-700 uppercase border-b">
            <tr>
                <th className="px-4 py-3 w-28 text-center">문서번호</th>
                <th className="px-6 py-3 w-auto text-center whitespace-nowrap">제목</th>
                <th className="px-6 py-3 w-32 text-center whitespace-nowrap">기안일</th>
                
                {isApproveBox && (
                <th className="px-6 py-3 w-32 text-center text-blue-600 font-bold whitespace-nowrap">결재일</th>
                )}

                {!isDraftOrTemp && (
                <th className="px-6 py-3 w-24 text-center whitespace-nowrap">기안자</th>
                )}
                <th className="px-6 py-3 w-24 text-center whitespace-nowrap">상태</th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr>
                <td colSpan={colCount} className="text-center py-20">데이터를 불러오는 중...</td>
                </tr>
            ) : docList.length === 0 ? (
                <tr>
                <td colSpan={colCount} className="text-center py-20">문서가 없습니다.</td>
                </tr>
            ) : (
                docList.map((doc) => (
                <tr 
                    key={doc.docNo} 
                    onClick={() => navigate(`/approval/detail/${doc.docNo}`)}
                    className="bg-white border-b hover:bg-gray-50 cursor-pointer transition-colors"
                >
                    <td className="px-4 py-3 font-mono text-center text-xs">
                        {renderDocNo(doc.docNo)}
                    </td>
                    
                    <td className="px-6 py-4 font-medium text-gray-900 truncate">
                    <div className="flex items-center">
                        <span className="truncate block" title={doc.approvalTitle}>
                        {doc.approvalTitle}
                        </span>
                        {doc.tempSaveYn === 'Y' && (
                        <span className="text-red-500 text-xs ml-2 font-bold whitespace-nowrap shrink-0">
                            [임시]
                        </span>
                        )}
                    </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center whitespace-nowrap">{doc.approvalDate || '-'}</td>

                    {isApproveBox && (
                    <td className="px-6 py-4 text-center text-blue-600 font-bold whitespace-nowrap">
                        {doc.appLineDate || '-'}
                    </td>
                    )}
                    
                    {!isDraftOrTemp && (
                        <td className="px-6 py-4 text-center whitespace-nowrap truncate">{doc.empName || '나'}</td>
                    )}
                    
                    <td className="px-6 py-4 text-center whitespace-nowrap">{getStatusBadge(doc.approvalStatus)}</td>
                </tr>
                ))
            )}
            </tbody>
        </table>
        </div>

        {!loading && docList.length > 0 && pagination && (
            <Pagination 
                pagination={pagination} 
                setPage={setPage} 
            />
        )}
    </div>
  );
}