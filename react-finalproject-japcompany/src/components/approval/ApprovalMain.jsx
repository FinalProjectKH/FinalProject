import React from 'react';
import { Outlet } from 'react-router-dom';
import ApprovalSidebar from './ApprovalSidebar'; // 기존에 만든 사이드바
import ApprovalHeader from './ApprovalHeader';   // 🔥 방금 만든 헤더

export default function ApprovalMain() {
  return (
    <div className="flex w-full h-full bg-white">
      {/* 1. 좌측: 전자결재 사이드바 (고정) */}
      <div className="flex-shrink-0 z-20">
        <ApprovalSidebar />
      </div>

      {/* 2. 우측: 컨텐츠 영역 (헤더 + 내용) */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        
        {/* 2-1. 상단 헤더 (고정) */}
        <ApprovalHeader />

        {/* 2-2. 실제 페이지 내용 (여기만 스크롤됨) */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Outlet 자리에 'ApprovalHome', 'WritePage' 등이 들어옴 */}
          <div className="max-w-7xl mx-auto"> 
             <Outlet /> 
          </div>
        </div>

      </div>
    </div>
  );
}