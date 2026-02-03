import { useOrgStore } from "../../store/orgStore";
import { useState } from "react";

const OrgTreeNode = ({ nodeId, depth =0, onOpenEmp }) => {
    const orgMap = useOrgStore((s)=>s.orgMap);
    const node = orgMap?.[nodeId];
    if(!node) return null;

    const [open, setOpen] = useState(nodeId === "COMPANY");
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    const canToggle =
    (node.type === "dept" || node.type === "exec") && hasChildren;

    const isGroup = node.type === "company" || node.type === "exec" || node.type === "dept";

    const toggle = () => {
        if (!canToggle) return;
        setOpen((v) => !v);
    };

    let title  = "";
    let sub  = "";

    if(node.type == "company" || node.type === "exec"){
        title = node.data?.name ?? node.id;
    }else if(node.type === "dept"){
        title = node.data?.deptName ?? node.id;
    }else if(node.type === "emp"){
        title = node.data?.empName ?? node.id;
        if (node.data?.positionCode) sub = node.data.positionCode;
    }

    const paddingLeft = depth * 14;

    return(
    <div>
      {/* 한 줄(노드) */}
      <div
        className={`flex items-center gap-2 py-1 rounded ${
          isGroup ? "font-semibold text-gray-900" : "font-medium text-gray-800"
        }`}
        style={{ paddingLeft }}
      >

        {/* 화살표: 자식이 있을 때만 */}
        <button
          type="button"
          onClick={() => {
            if (node.type === "emp") onOpenEmp?.(node.data);   
            else toggle();        
          }}
          className={`text-left ${
            node.type === "dept" ? "font-semibold text-gray-900" : "font-medium text-gray-800"
          } ${canToggle ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
        >

        {/* 화살표: 부서만 표시 */}
        <span className={`w-5 text-gray-500 ${canToggle ? "" : "opacity-0"}`}>
          {canToggle ? (open ? "▼" : "▶") : ""}
        </span>

          {title}
          {node.type === "emp" && sub && (
            <span className="ml-2 text-xs text-gray-500">({sub})</span>
          )}
        </button>
      </div>

      {/* 자식 렌더링: open일 때만 */}
        {hasChildren && (
            <div className="border-l border-gray-200 ml-[10px]">
            {canToggle
             ? open && node.children.map((childId) => (
                 <OrgTreeNode key={childId} nodeId={childId} depth={depth + 1} onOpenEmp={onOpenEmp}/>
               ))
             : node.children.map((childId) => (
                 <OrgTreeNode key={childId} nodeId={childId} depth={depth + 1} onOpenEmp={onOpenEmp}/>
               ))}
            </div>
        )}
    </div>
    );
};

export default OrgTreeNode;