import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 아이콘: npm install react-icons
import { FaChevronDown, FaChevronRight, FaCog, FaRedo } from 'react-icons/fa';
import ApprovalModal from './ApprovalModal';

export default function ApprovalSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. 카운트 상태 관리 (XML 쿼리 별칭과 일치시킴)
  const [counts, setCounts] = useState({
    waitCount: 0,      // 결재 대기
    upcomingCount: 0,  // 결재 예정
    draftCount: 0,     // 기안 문서
    tempCount: 0,      // 임시 저장
    approveCount: 0    // 결재 문서 (완료+반려)
  });

  // 아코디언 상태 관리
  const [openSections, setOpenSections] = useState({
    "결재하기": true,
    "개인 문서함": true,
    "설정": false
  });

  // 2. 카운트 데이터 가져오기 (세션 기반 / 파라미터 X)
  const fetchCounts = () => {
    fetch('/api/approval/sidebar') 
      .then(res => {
        if (!res.ok) throw new Error("통신 실패");
        return res.json();
      })
      .then(data => {
        if (data) {
            console.log("사이드바 갱신:", data);
            
            // 🔥 XML 쿼리 별칭(AS "waitCount" 등)과 정확히 매칭
            setCounts({
                waitCount: data.waitCount || 0,
                upcomingCount: data.upcomingCount || 0,
                draftCount: data.draftCount || 0,
                tempCount: data.tempCount || 0,
                approveCount: data.approveCount || 0
            });
        }
      })
      .catch(err => console.error("카운트 로드 실패:", err));
  };

  // 3. 경로가 변경될 때마다(기안 상신, 결재 처리 등) 카운트 갱신
  useEffect(() => {
    fetchCounts();
  }, [location.pathname]);


  // 토글 함수
  const toggleSection = (title) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // 4. 메뉴 데이터 (counts 상태 연결)
  const MENUS = [
    {
      title: "결재하기",
      hasSettings: false,
      items: [
        { 
            id: "wait", 
            label: "결재 대기 문서", 
            path: "/approval/wait", 
            count: counts.waitCount // 🔥 대기 문서 수
        },
        { 
            id: "upcoming", 
            label: "결재 예정 문서", 
            path: "/approval/upcoming",
            count: counts.upcomingCount // 🔥 예정 문서 수
        },
      ]
    },
    {
      title: "개인 문서함",
      items: [
        { 
            id: "draft", 
            label: "기안 문서함", 
            path: "/approval/draft",
            count: counts.draftCount // 🔥 기안 진행 수
        },
        { 
            id: "temp", 
            label: "임시 저장함", 
            path: "/approval/temp",
            count: counts.tempCount // 🔥 임시 저장 수
        },
        { 
            id: "approve", 
            label: "결재 문서함", 
            path: "/approval/approve",
        },
      ]
    },
  ];

  const handleNewApproval = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col font-sans select-none">
      
      {/* 상단 타이틀 */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 mb-2">
        <h1 
            className="text-xl font-extrabold text-gray-800 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => { navigate('/approval'); fetchCounts(); }}
            title="새로고침"
        >
            전자결재
            <FaRedo className="text-gray-300 text-xs hover:text-blue-500 hover:rotate-180 transition-all duration-500" />
        </h1>
      </div>

      {/* 새 결재 진행 버튼 (흰색 배경 + 회색 테두리 복구) */}
      <div className="p-4">
        <button 
          onClick={handleNewApproval}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm active:scale-95"
        >
          새 결재 진행
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {MENUS.map((group, idx) => (
          <div key={idx} className="mb-4">
            
            {/* 그룹 헤더 */}
            <div 
              onClick={() => toggleSection(group.title)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">
                  {openSections[group.title] ? <FaChevronDown /> : <FaChevronRight />}
                </span>
                <span className="text-sm font-bold text-gray-600">{group.title}</span>
              </div>
              
              {group.hasSettings && (
                <button className="text-gray-400 hover:text-gray-600">
                  <FaCog className="text-sm"/>
                </button>
              )}
            </div>
            
            {/* 소메뉴 아이템들 */}
            {openSections[group.title] && (
              <div className="flex flex-col mt-1 space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full text-left flex items-center justify-between pl-9 pr-3 py-2 text-sm rounded transition-all ${
                        isActive 
                          ? "bg-blue-50 text-blue-700 font-bold" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.label}</span>

                      {/* 🔥 카운트 뱃지 (0보다 클 때만 표시) */}
                      {item.count > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isActive ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        
      </div>
    
    <ApprovalModal
        isOpen={isModalOpen}
        onClose={()=> setIsModalOpen(false)}
    />
    </div>
  );
}