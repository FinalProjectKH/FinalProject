import React from 'react';

export default function ApprovalHome() {
  return (
    <div className="space-y-6">
      
      {/* 상단: 카드 영역 (빠른 결재 등) */}
      <div className="flex gap-6">
        {/* 예시 카드 1 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-80">
           <div className="flex justify-between items-start mb-4">
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">긴급</span>
              <span className="text-gray-400 text-sm">2026-02-02</span>
           </div>
           <h3 className="font-bold text-lg text-gray-800 mb-2">해외출장신청</h3>
           <div className="text-sm text-gray-500 space-y-1 mb-6">
              <p>기안자: 김철수 대리</p>
              <p>결재양식: 해외출장신청서</p>
           </div>
           <button className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium transition-colors">
              결재하기
           </button>
        </div>
      </div>

      {/* 하단: 기안 진행 문서 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
           <h3 className="font-bold text-gray-800">기안 진행 문서</h3>
           <span className="text-xs text-gray-400 cursor-pointer">더보기 +</span>
        </div>
        <table className="w-full text-sm text-left">
           <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                 <th className="px-6 py-3">기안일</th>
                 <th className="px-6 py-3">결재양식</th>
                 <th className="px-6 py-3">제목</th>
                 <th className="px-6 py-3">상태</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                 <td className="px-6 py-4">2026-02-02</td>
                 <td className="px-6 py-4">휴가신청서</td>
                 <td className="px-6 py-4 text-gray-800 font-medium">몸살감기로 인한 연차 사용</td>
                 <td className="px-6 py-4"><span className="text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded text-xs">진행중</span></td>
              </tr>
              {/* 데이터 더미... */}
           </tbody>
        </table>
      </div>

    </div>
  );
}