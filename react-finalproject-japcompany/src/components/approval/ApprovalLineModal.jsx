import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaUser, FaBuilding, FaArrowRight, FaTrash, FaChevronRight, FaChevronDown } from 'react-icons/fa';

export default function ApprovalLineModal({ isOpen, onClose, onConfirm, drafter }) {
  if (!isOpen) return null;

  // 🔥 VITE 환경 변수 가져오기
  const API_URL = import.meta.env.VITE_BASE_URL;

  // 1. 상태 관리
  const [orgChart, setOrgChart] = useState([]);      
  const [selectedUser, setSelectedUser] = useState(null); 
  const [approvalLine, setApprovalLine] = useState([]);   
  const [loading, setLoading] = useState(true);           

  // 2. 모달 열릴 때 백엔드에서 데이터 가져오기
  useEffect(() => {
    setLoading(true);

    // 🔥 API 주소 수정 및 credentials 추가
    fetch(`${API_URL}/org/orgTree`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        credentials: 'include' 
    })
      .then(res => {
        if (!res.ok) throw new Error("네트워크 응답이 올바르지 않습니다.");
        return res.json();
      })
      .then(flatData => {
        const treeData = buildHierarchy(flatData);
        setOrgChart(treeData);
        setLoading(false);
      })
      .catch(err => {
        console.error("조직도 로딩 실패:", err);
        setLoading(false);
        setOrgChart([]); 
      });
  }, []);

  // 트리 변환 로직
  const buildHierarchy = (flatList) => {
    const deptMap = {};
    const rootNodes = [];

    flatList.forEach(row => {
      const dCode = row.deptCode; 
      const dName = row.deptName || '부서미정';
      const pCode = row.parentDeptCode || null; 

      if (!dCode) return; 

      if (!deptMap[dCode]) {
        deptMap[dCode] = {
          id: dCode,       
          name: dName,     
          parentId: pCode, 
          type: 'dept',
          isOpen: true,        
          children: [],          
          members: []            
        };
      }

      if (row.empNo) {
        deptMap[dCode].members.push({
          id: String(row.empNo),
          name: row.empName,     
          rank: row.positionName || row.jobName || '', 
          dept: dName,
          type: 'user'
        });
      }
    });

    Object.values(deptMap).forEach(node => {
      if (node.parentId && deptMap[node.parentId]) {
        deptMap[node.parentId].children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    Object.values(deptMap).forEach(node => {
       node.children = [...node.children, ...node.members];
       delete node.members; 
    });

    return rootNodes;
  };

  const toggleDept = (deptId) => {
    setOrgChart(prevChart => {
      const toggleNode = (nodes) => {
        return nodes.map(node => {
          if (node.id === deptId) {
            return { ...node, isOpen: !node.isOpen };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: toggleNode(node.children) };
          }
          return node;
        });
      };
      return toggleNode(prevChart);
    });
  };

  const handleSelectNode = (node) => {
    setSelectedUser(node);
  };

  const handleAddApprover = (targetNode = null) => {
    const target = targetNode || selectedUser;

    if (!target) return alert("추가할 사용자를 선택해주세요.");
    if (target.type === 'dept') return; 

    if (drafter && String(target.id) === String(drafter.empNo)) {
      return alert("본인(기안자)은 결재선에 포함될 수 없습니다.");
    }

    if (approvalLine.length >= 3) {
      return alert("결재자는 최대 3명까지만 지정 가능합니다.");
    }

    if (approvalLine.find(line => line.id === target.id)) {
      return alert("이미 결재선에 존재하는 사용자입니다.");
    }

    setApprovalLine([
      ...approvalLine, 
      { 
          id: target.id,           
          name: target.name,       
          rank: target.rank,       
          dept: target.dept,   
          type: '결재', 
          order: approvalLine.length + 1 
      }
    ]);
  };

  const handleRemoveApprover = (id) => {
    setApprovalLine(approvalLine.filter(user => user.id !== id));
  };

  const handleConfirm = () => {
    if (approvalLine.length === 0) {
      if(!window.confirm("결재선을 지정하지 않고 닫으시겠습니까?")) return;
    }
    onConfirm(approvalLine); 
    onClose(); 
  };
  
  const renderTree = (nodes) => {
    return nodes.map((node) => (
       <div key={node.id} className="mb-1 ml-4 select-none">
          {node.type === 'dept' && (
             <div 
               onClick={() => {
                   handleSelectNode(node); 
                   toggleDept(node.id);    
               }}
               className={`flex items-center gap-2 font-bold text-gray-700 mb-1 cursor-pointer p-1 rounded transition-colors
                 ${selectedUser?.id === node.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}
             >
                {node.isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                <FaBuilding className="text-blue-500"/> 
                {node.name}
             </div>
          )}

          {node.type === 'user' && (
             <div 
               onClick={() => handleSelectNode(node)}
               onDoubleClick={() => handleAddApprover(node)} 
               className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm ml-6 
                 ${selectedUser?.id === node.id ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}
             >
                <FaUser className="text-gray-400 text-xs"/>
                <span>{node.name}</span> <span className="text-gray-400 text-xs">({node.rank})</span>
             </div>
          )}

          {node.isOpen && node.children && node.children.length > 0 && (
             <div className="border-l-2 border-gray-200 ml-2 pl-2">
                {renderTree(node.children)}
             </div>
          )}
       </div>
    ));
  };
  
  return createPortal(
    <div className="fixed inset-0 !z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[900px] h-[650px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FaUser /> 결재선 지정</h2>
          <button onClick={onClose}><FaTimes className="text-gray-500 hover:text-black"/></button>
        </div>

        <div className="flex flex-1 p-4 gap-4 overflow-hidden">
          <div className="flex-1 border border-gray-300 rounded flex flex-col">
            <div className="bg-gray-100 p-3 border-b font-bold text-sm text-center">조직도</div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               {loading ? (
                 <div className="text-center text-gray-400 mt-10">로딩 중...</div>
               ) : (
                 orgChart.length > 0 ? renderTree(orgChart) : <div className="text-center text-gray-400 mt-10">데이터 없음</div>
               )}
            </div>
          </div>

          <div className="w-16 flex flex-col justify-center items-center gap-2">
            <button 
                onClick={() => handleAddApprover()} 
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-md active:scale-95"
                title="선택 추가"
            >
                <FaArrowRight />
            </button>
          </div>

          <div className="flex-1 border border-gray-300 rounded flex flex-col">
             <div className="bg-gray-100 p-3 border-b font-bold text-sm text-center">지정된 결재 라인 (최대 3명)</div>
             <div className="flex-1 overflow-y-auto bg-gray-50 p-2 space-y-2 custom-scrollbar">
                
                <div className="bg-white p-3 border border-blue-200 rounded flex justify-between items-center shadow-sm opacity-80">
                   <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-bold">기안</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{drafter?.empName || '나'}</span>
                        <span className="text-xs text-gray-500">{drafter?.deptName || ''}</span>
                      </div>
                   </div>
                </div>

                {approvalLine.map((approver, index) => (
                   <div key={approver.id} className="bg-white p-3 border border-gray-300 rounded flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                         <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-bold">결재 {index + 1}</span>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">
                                {approver.name} <span className="text-xs font-normal text-gray-600">{approver.rank}</span>
                            </span>
                            <span className="text-xs text-gray-400">{approver.dept}</span>
                         </div>
                      </div>
                      <button onClick={() => handleRemoveApprover(approver.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <FaTrash size={14}/>
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium transition-colors">취소</button>
          <button onClick={handleConfirm} className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow-md transition-colors">적용하기</button>
        </div>
      </div>
    </div>,
    document.body
  );
}