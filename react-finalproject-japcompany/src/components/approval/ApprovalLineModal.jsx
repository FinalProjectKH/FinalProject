import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaUser, FaBuilding, FaArrowRight, FaTrash, FaChevronRight, FaChevronDown } from 'react-icons/fa'; // 아이콘 추가됨

export default function ApprovalLineModal({ isOpen, onClose, onConfirm, drafter }) {
  if (!isOpen) return null;

  // 1. 상태 관리
  const [orgChart, setOrgChart] = useState([]);      
  const [selectedUser, setSelectedUser] = useState(null); 
  const [approvalLine, setApprovalLine] = useState([]);   
  const [loading, setLoading] = useState(true);           

  // 2. 모달 열릴 때 DB에서 조직도 가져오기
  useEffect(() => {
    setLoading(true);

    fetch("/org/orgTree", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error("네트워크 응답이 올바르지 않습니다.");
        return res.json();
      })
      .then(flatData => {
        const treeData = convertToTree(flatData);
        setOrgChart(treeData);
        setLoading(false);
      })
      .catch(err => {
        console.error("조직도 로딩 실패:", err);
        setLoading(false);
        setOrgChart([]); 
      });
  }, []);

  // 리스트 -> 트리 변환 함수
  const convertToTree = (list) => {
    const deptMap = {}; 
    list.forEach(emp => {
      const deptName = emp.deptName || '부서미정';
      
      if (!deptMap[deptName]) {
        deptMap[deptName] = {
          id: `dept_${deptName}`, 
          name: deptName,
          type: 'dept',
          isOpen: false, // 🔥 [추가] 접기/펴기 상태 (기본값: false-접힘)
          children: [] 
        };
      }
      
      deptMap[deptName].children.push({
        id: String(emp.empNo),     
        name: emp.empName,         
        rank: emp.positionName,    
        dept: deptName,            
        type: 'user'
      });
    });
    return Object.values(deptMap);
  };

  // 🔥 [기능 1] 부서 접기/펴기 토글 함수
  const toggleDept = (deptId) => {
    setOrgChart(prevChart => {
      // 재귀적으로 트리를 탐색하며 클릭한 부서의 isOpen을 뒤집음
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

  // 좌측 트리 선택 (클릭 시 하이라이트)
  const handleSelectNode = (node) => {
    setSelectedUser(node);
  };

  // 🔥 [기능 2] 결재선 추가 로직 (param을 받도록 수정됨)
  const handleAddApprover = (targetNode = null) => {
    // 1. 대상 선정: 더블클릭한 노드(targetNode)가 있으면 그걸 쓰고, 없으면 선택된(selectedUser) 노드 사용
    const target = targetNode || selectedUser;

    if (!target) return alert("추가할 사용자를 선택해주세요.");
    
    // 2. 부서 선택 방지
    if (target.type === 'dept') {
      // 부서 더블클릭 시에는 그냥 펼치기/접기만 동작하도록 여기서 리턴하거나 경고
      // 여기선 더블클릭으로 추가 안되게 막음
      return; 
    }

    // 3. 본인 추가 방지
    if (drafter && String(target.id) === String(drafter.empNo)) {
      return alert("본인(기안자)은 결재선에 포함될 수 없습니다.");
    }

    // 4. 인원 제한
    if (approvalLine.length >= 3) {
      return alert("결재자는 최대 3명까지만 지정 가능합니다.");
    }

    // 5. 중복 방지
    if (approvalLine.find(line => line.id === target.id)) {
      return alert("이미 결재선에 존재하는 사용자입니다.");
    }

    // 추가
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

  // 삭제 핸들러
  const handleRemoveApprover = (id) => {
    setApprovalLine(approvalLine.filter(user => user.id !== id));
  };

  // 적용하기
  const handleConfirm = () => {
    if (approvalLine.length === 0) {
      if(!window.confirm("결재선을 지정하지 않고 닫으시겠습니까?")) return;
    }
    onConfirm(approvalLine); 
    onClose(); 
  };
  
  // 🔥 트리 렌더링 함수 (접기/펴기 + 더블클릭 적용)
  const renderTree = (nodes) => {
    return nodes.map((node) => (
       <div key={node.id} className="mb-1 ml-4 select-none">
          
          {/* 1) 부서 노드 */}
          {node.type === 'dept' && (
             <div 
               onClick={() => {
                   handleSelectNode(node); // 선택 하이라이트
                   toggleDept(node.id);    // 🔥 클릭 시 펼치기/접기 토글
               }}
               className={`flex items-center gap-2 font-bold text-gray-700 mb-1 cursor-pointer p-1 rounded transition-colors
                 ${selectedUser?.id === node.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}
             >
                {/* 🔥 접힘/펼침 아이콘 표시 */}
                {node.isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                <FaBuilding className="text-blue-500"/> 
                {node.name}
             </div>
          )}

          {/* 2) 사원 노드 */}
          {/* 🔥 부서가 열려있을 때만(node.isOpen === true) 렌더링 */}
          {node.type === 'user' && (
             <div 
               onClick={() => handleSelectNode(node)}
               onDoubleClick={() => handleAddApprover(node)} // 🔥 [기능 2] 더블클릭 시 바로 추가!
               className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm ml-6 
                 ${selectedUser?.id === node.id ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}
             >
                <FaUser className="text-gray-400 text-xs"/>
                <span>{node.name}</span> <span className="text-gray-400 text-xs">({node.rank})</span>
             </div>
          )}

          {/* 3) 자식 노드 재귀 (부서가 열려있어야 렌더링됨) */}
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
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FaUser /> 결재선 지정</h2>
          <button onClick={onClose}><FaTimes className="text-gray-500 hover:text-black"/></button>
        </div>

        {/* 바디 */}
        <div className="flex flex-1 p-4 gap-4 overflow-hidden">
          {/* 좌측: 조직도 */}
          <div className="flex-1 border border-gray-300 rounded flex flex-col">
            <div className="bg-gray-100 p-3 border-b font-bold text-sm text-center">조직도</div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               {loading ? <div className="text-center text-gray-400 mt-10">로딩 중...</div> : (orgChart.length > 0 ? renderTree(orgChart) : <div className="text-center text-gray-400 mt-10">데이터 없음</div>)}
            </div>
          </div>

          {/* 중앙: 버튼 */}
          <div className="w-16 flex flex-col justify-center items-center gap-2">
            <button 
                onClick={() => handleAddApprover()} // 그냥 클릭하면 selectedUser 사용
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-md active:scale-95"
                title="선택 추가"
            >
                <FaArrowRight />
            </button>
          </div>

          {/* 우측: 결재선 리스트 */}
          <div className="flex-1 border border-gray-300 rounded flex flex-col">
             <div className="bg-gray-100 p-3 border-b font-bold text-sm text-center">지정된 결재 라인 (최대 3명)</div>
             <div className="flex-1 overflow-y-auto bg-gray-50 p-2 space-y-2 custom-scrollbar">
                <div className="bg-white p-3 border border-blue-200 rounded flex justify-between items-center shadow-sm opacity-80">
                   <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-bold">기안</span>
                      <div className="flex flex-col"><span className="text-sm font-bold text-gray-800">{drafter?.empName || '나'}</span><span className="text-xs text-gray-500">{drafter?.deptName || ''}</span></div>
                   </div>
                </div>
                {approvalLine.map((approver, index) => (
                   <div key={approver.id} className="bg-white p-3 border border-gray-300 rounded flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                         <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-bold">결재 {index + 1}</span>
                         <div className="flex flex-col"><span className="text-sm font-bold text-gray-800">{approver.name} <span className="text-xs font-normal text-gray-600">{approver.rank}</span></span><span className="text-xs text-gray-400">{approver.dept}</span></div>
                      </div>
                      <button onClick={() => handleRemoveApprover(approver.id)} className="text-gray-400 hover:text-red-500 p-1"><FaTrash size={14}/></button>
                   </div>
                ))}
             </div>
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium transition-colors">취소</button>
          <button onClick={handleConfirm} className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow-md transition-colors">적용하기</button>
        </div>
      </div>
    </div>,
    document.body
  );
}