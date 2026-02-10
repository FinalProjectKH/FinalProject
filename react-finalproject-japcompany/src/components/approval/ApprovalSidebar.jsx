import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 아이콘 설치 필요: npm install react-icons
import { FaChevronDown, FaChevronRight, FaCog } from 'react-icons/fa';
import ApprovalModal from './ApprovalModal';

export default function ApprovalSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 아코디언 상태 관리 (true: 열림, false: 닫힘)
  const [openSections, setOpenSections] = useState({
    "결재하기": true,
    "개인 문서함": true,
    "설정": false
  });

  // 토글 함수
  const toggleSection = (title) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // 메뉴 데이터
  const MENUS = [
    {
      title: "결재하기",
      hasSettings: false,
      items: [
        { id: "wait", label: "결재 대기 문서", path: "/approval/wait", count: 1 }, // 🔥 파란 숫자
        { id: "upcoming", label: "결재 예정 문서", path: "/approval/upcoming" },
      ]
    },
    {
      title: "개인 문서함",
      hasSettings: true, // 톱니바퀴 표시
      items: [
        { id: "draft", label: "기안 문서함", path: "/approval/draft" },
        { id: "temp", label: "임시 저장함", path: "/approval/temp" },
        { id: "approve", label: "결재 문서함", path: "/approval/approve" },
      ]
    },
  ];

  // 모달 띄우기 핸들러
  const handleNewApproval = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col font-sans">
      
      {/* 1. 상단 타이틀 */}
      <div className="h-14 flex items-center px-5 border-b border-gray-100">
              <h1 
        className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => navigate('/approval')}
        title="새로고침"
      >
        <br />전자결재
      </h1>
      </div>

      {/* 2. 새 결재 진행 버튼 (다우오피스 스타일: 흰색 배경 + 테두리) */}
      <div className="p-4">
        <button 
          onClick={handleNewApproval}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm active:scale-95"
        >
          새 결재 진행
        </button>
      </div>

      {/* 3. 메뉴 리스트 (아코디언) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {MENUS.map((group, idx) => (
          <div key={idx} className="mb-2">
            
            {/* 그룹 헤더 */}
            <div 
              onClick={() => toggleSection(group.title)}
              className="flex items-center justify-between px-5 py-2 cursor-pointer group hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">
                  {openSections[group.title] ? <FaChevronDown /> : <FaChevronRight />}
                </span>
                <span className="text-sm font-bold text-gray-700">{group.title}</span>
              </div>
              
              {/* 설정 아이콘 */}
              {group.hasSettings && (
                <button className="text-gray-400 hover:text-gray-600">
                  <FaCog className="text-sm"/>
                </button>
              )}
            </div>
            
            {/* 소메뉴 아이템들 */}
            {openSections[group.title] && (
              <div className="flex flex-col pb-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full text-left flex items-center justify-between pl-10 pr-5 py-2 text-sm transition-colors ${
                        isActive 
                          ? "text-blue-600 font-semibold bg-blue-50 border-r-2 border-blue-600" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.label}</span>

                      {/* 카운트 숫자 */}
                      {item.count > 0 && (
                        <span className="text-blue-500 font-bold text-xs">
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