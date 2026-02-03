import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ApprovalHeader() {
  const location = useLocation();
  const pathname = location.pathname;

  // 🔄 URL에 따라 제목 변경하는 로직
  const getPageTitle = () => {
    // 1. 작성 페이지 (URL에 /write/가 포함된 경우)
    if (pathname.includes('/write/')) {
       if (pathname.includes('general')) return '기본 기안서 작성';
       if (pathname.includes('vacation')) return '휴가 신청서 작성';
       if (pathname.includes('expense')) return '지출 결의서 작성';
       return '결재 문서 작성';
    }

    // 2. 메뉴별 제목 매핑
    switch (pathname) {
      case '/approval': 
        return '전자결재 홈'; 
      case '/approval/wait':
        return '결재 대기 문서'; 
      case '/approval/upcoming':
        return '결재 예정 문서';
      case '/approval/refer':
        return '참조/열람 대기 문서';
      case '/approval/draft':
        return '기안 문서함';
      case '/approval/temp':
        return '임시 저장함';
      case '/approval/approve':
        return '결재 문서함';
      case '/approval/dept':
        return '부서 기안함';
      case '/approval/sign':
        return '서명 관리';
      default:
        return '전자결재';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 flex-shrink-0 z-10">
      <h2 className="text-xl font-bold text-gray-800">
        {getPageTitle()}
      </h2>
      
      {/* (선택) 우측에 빵부스러기(Breadcrumbs)나 추가 버튼 배치 가능 */}
    </header>
  );
}