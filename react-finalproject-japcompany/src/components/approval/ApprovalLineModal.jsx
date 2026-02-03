import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaUser, FaBuilding, FaArrowRight, FaTrash } from 'react-icons/fa';

// 🌳 임시 조직도 데이터 (나중엔 API로 가져올 부분)
const MOCK_ORG_CHART = [
  {
    id: 'dept1', name: '경영지원본부', type: 'dept', isOpen: true,
    children: [
      { id: 'u1', name: '강회계', rank: '부장', dept: '경영지원본부', type: 'user' },
      { id: 'u2', name: '박인사', rank: '과장', dept: '경영지원본부', type: 'user' },
    ]
  },
  {
    id: 'dept2', name: '개발본부', type: 'dept', isOpen: true,
    children: [
      { id: 'u3', name: '이개발', rank: '팀장', dept: '개발1팀', type: 'user' },
      { id: 'u4', name: '최코딩', rank: '대리', dept: '개발1팀', type: 'user' },
      { id: 'u5', name: '정서버', rank: '사원', dept: '개발2팀', type: 'user' },
    ]
  }
];

export default function ApprovalLineModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  const [selectedUser, setSelectedUser] = useState(null); // 조직도에서 클릭한 사람
  const [approvalLine, setApprovalLine] = useState([]);   // 오른쪽 결재선 리스트

  // 1. 사람 선택 (왼쪽)
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  // 2. 결재선 추가 (가운데 화살표 버튼)
  const handleAddApprover = () => {
    if (!selectedUser) return alert("추가할 사람을 선택해주세요.");
    
    // 중복 체크
    if (approvalLine.find(line => line.id === selectedUser.id)) {
      return alert("이미 결재선에 존재하는 사용자입니다.");
    }

    setApprovalLine([
      ...approvalLine, 
      { ...selectedUser, type: '결재', order: approvalLine.length + 1 }
    ]);
  };

  // 3. 결재선 삭제 (오른쪽 휴지통)
  const handleRemoveApprover = (id) => {
    setApprovalLine(approvalLine.filter(user => user.id !== id));
  };

  // 4. 적용하기
  const handleConfirm = () => {
    onConfirm(approvalLine); // 부모에게 데이터 전달
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 !z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800">결재선 지정</h2>
          <button onClick={onClose}><FaTimes className="text-gray-500 hover:text-black"/></button>
        </div>

        {/* 바디 (3단 레이아웃: 조직도 -> 이동버튼 -> 결재선) */}
        <div className="flex flex-1 p-4 gap-4 overflow-hidden">
          
          {/* 1. 좌측: 조직도 트리 */}
          <div className="flex-1 border border-gray-300 rounded flex flex-col">
            <div className="bg-gray-100 p-2 border-b font-bold text-sm text-center">조직도</div>
            <div className="flex-1 overflow-y-auto p-2">
              {MOCK_ORG_CHART.map((dept) => (
                <div key={dept.id} className="mb-2">
                  <div className="flex items-center gap-2 font-bold text-gray-700 mb-1 cursor-pointer">
                    <FaBuilding className="text-blue-500"/> {dept.name}
                  </div>
                  <div className="pl-6 space-y-1">
                    {dept.children.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => handleSelectUser(user)}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm ${selectedUser?.id === user.id ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}
                      >
                        <FaUser className="text-gray-400 text-xs"/>
                        <span>{user.name}</span> 
                        <span className="text-gray-400 text-xs">({user.rank})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 중앙: 이동 버튼 */}
          <div className="w-12 flex flex-col justify-center items-center gap-2">
            <button 
              onClick={handleAddApprover}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm"
            >
              <FaArrowRight />
            </button>
          </div>

          {/* 3. 우측: 결재선 리스트 */}
          <div className="flex-1 border border-gray-300 rounded flex flex-col">
            <div className="bg-gray-100 p-2 border-b font-bold text-sm text-center">결재 라인</div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-2 space-y-2">
              
              {/* 기안자 (고정) */}
              <div className="bg-white p-3 border border-blue-200 rounded flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-bold">기안</span>
                    <span className="text-sm font-bold">김사원 (나)</span>
                 </div>
              </div>

              {/* 추가된 결재자들 */}
              {approvalLine.map((approver, index) => (
                <div key={approver.id} className="bg-white p-3 border border-gray-200 rounded flex justify-between items-center shadow-sm animate-fade-in-up">
                   <div className="flex items-center gap-2">
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-bold">결재 {index + 1}</span>
                      <span className="text-sm font-bold text-gray-700">{approver.name} {approver.rank}</span>
                      <span className="text-xs text-gray-400">({approver.dept})</span>
                   </div>
                   <button onClick={() => handleRemoveApprover(approver.id)} className="text-red-400 hover:text-red-600">
                     <FaTrash size={12}/>
                   </button>
                </div>
              ))}

              {approvalLine.length === 0 && (
                <div className="text-center text-gray-400 text-xs mt-10">
                  좌측에서 결재자를 선택하여<br/>추가해주세요.
                </div>
              )}

            </div>
          </div>

        </div>

        {/* 푸터 */}
        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 text-sm">취소</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold">적용하기</button>
        </div>

      </div>
    </div>,
    document.body
  );
}