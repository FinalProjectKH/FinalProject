import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPaperPlane } from 'react-icons/fa';

export default function ApprovalWrite() {
  const { formId } = useParams();
  const navigate = useNavigate();

  // 입력 데이터 상태 관리
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  // 폼 제목 매핑
  const getFormTitle = () => {
    switch(formId) {
      case 'vacation': return '휴가 신청서';
      case 'expense': return '지출 결의서';
      default: return '기본 기안서';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-screen">
      
      {/* 1. 툴바 (상단 버튼 영역) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
            <FaArrowLeft /> 뒤로가기
          </button>
          <h2 className="text-xl font-bold text-gray-800">{getFormTitle()}</h2>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
            <FaSave className="text-gray-500"/> 임시저장
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <FaPaperPlane /> 결재상신
          </button>
        </div>
      </div>

      {/* 2. 실제 문서 작성 영역 */}
      <div className="p-8 max-w-5xl mx-auto">
        
        {/* 상단 정보 & 결재선 라인 */}
        <div className="flex justify-between items-start mb-8 gap-8">
          
          {/* 왼쪽: 문서 정보 테이블 */}
          <table className="border-collapse border border-gray-300 w-[300px] text-sm">
            <tbody>
              <tr>
                <td className="border border-gray-300 bg-gray-100 p-2 font-bold text-center w-24">기안자</td>
                <td className="border border-gray-300 p-2">김사원</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-100 p-2 font-bold text-center">기안부서</td>
                <td className="border border-gray-300 p-2">개발팀</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-100 p-2 font-bold text-center">기안일</td>
                <td className="border border-gray-300 p-2">{new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-100 p-2 font-bold text-center">문서번호</td>
                <td className="border border-gray-300 p-2 text-gray-400">자동채번</td>
              </tr>
            </tbody>
          </table>

          {/* 오른쪽: 결재선 (도장 쾅쾅) */}
          <div className="flex items-center gap-1">
            {/* 결재선 생성 버튼 (나중에 모달 연결) */}
            <button className="h-[100px] w-8 bg-gray-100 border border-gray-300 text-gray-500 text-xs writing-vertical hover:bg-gray-200 transition-colors rounded-l">
              결재선<br/>지정
            </button>
            
            {/* 결재방 (담당 -> 팀장 -> 부장) */}
            <div className="flex border border-gray-300">
                {/* 1. 기안자 (나) */}
                <div className="flex flex-col w-20 border-r border-gray-300">
                    <div className="bg-gray-100 text-center text-xs py-1 border-b border-gray-300">담당</div>
                    <div className="h-16 flex items-center justify-center text-sm font-bold text-gray-700">김사원</div>
                    <div className="bg-gray-50 text-center text-[10px] py-0.5 text-gray-400">상신</div>
                </div>
                {/* 2. 결재자 (비어있음 - 예시) */}
                <div className="flex flex-col w-20 border-r border-gray-300">
                    <div className="bg-gray-100 text-center text-xs py-1 border-b border-gray-300">팀장</div>
                    <div className="h-16 flex items-center justify-center text-gray-300 text-xs"></div>
                    <div className="bg-gray-50 text-center text-[10px] py-0.5 text-gray-400">미결</div>
                </div>
                {/* 3. 결재자 (비어있음 - 예시) */}
                <div className="flex flex-col w-20">
                    <div className="bg-gray-100 text-center text-xs py-1 border-b border-gray-300">부장</div>
                    <div className="h-16 flex items-center justify-center text-gray-300 text-xs"></div>
                    <div className="bg-gray-50 text-center text-[10px] py-0.5 text-gray-400">미결</div>
                </div>
            </div>
          </div>
        </div>

        {/* 제목 & 내용 입력 */}
        <div className="space-y-6">
            {/* 제목 */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="제목을 입력하세요"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>

            {/* 내용 (나중에 에디터로 교체 가능) */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">상세 내용</label>
                <textarea 
                    className="w-full border border-gray-300 rounded px-3 py-2 h-64 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="내용을 입력하세요"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
            </div>

            {/* 파일 첨부 */}
            <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer">
                <span className="text-2xl mb-2">📎</span>
                <p className="text-sm">클릭하여 파일을 첨부하거나 드래그 앤 드롭하세요.</p>
            </div>
        </div>

      </div>
    </div>
  );
}