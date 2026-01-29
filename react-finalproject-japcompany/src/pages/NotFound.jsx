import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* 1. 커다란 404 텍스트 (또는 아이콘) */}
        <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
        
        {/* 2. 메인 메시지 */}
        <h2 className="mt-8 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
          페이지를 찾을 수 없습니다.
        </h2>
        
        {/* 3. 상세 설명 */}
        <p className="mt-4 text-lg text-gray-500">
          죄송합니다. 요청하신 페이지가 삭제되었거나,<br className="hidden sm:inline" /> 
          이름이 변경되었거나, 일시적으로 사용할 수 없습니다.
        </p>
        
        {/* 4. 액션 버튼들 */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-base font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            이전 페이지
          </button>

          {/* 메인으로 가기 버튼 */}
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
          >
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}