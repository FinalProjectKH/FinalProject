import { useOrgStore } from "../../store/orgStore";
import { useEffect } from "react";

export const ActiveOrg =() =>{
    const fetchOrgTree = useOrgStore((s) => s.fetchOrgTree);
    const orgTree = useOrgStore((s) => s.orgTree);
    console.log("ORG TREE:", orgTree);
    
    useEffect(()=>{
        fetchOrgTree();
    },[fetchOrgTree]);

    return (

    <div className="space-y-2">
      {orgTree.map((emp) => (
        <div
          key={emp.empNo}
          className="p-2 rounded border border-gray-200"
        >
          <div className="font-medium">
            {emp.empName} ({emp.positionName})
          </div>
          <div className="text-xs text-gray-500">
            {emp.deptName ?? "회사"}
          </div>
        </div>
      ))}
    </div>
  );
};
