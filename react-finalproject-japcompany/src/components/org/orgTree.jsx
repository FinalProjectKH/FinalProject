import { useOrgStore } from "../../store/orgStore";
import { useEffect, useState  } from "react";
import OrgTreeNode from "../org/orgTreeNode"
import EmployeeModal from "../modal/EmployeeModal";

export const ActiveOrg =() =>{
    const fetchOrgTree = useOrgStore((s) => s.fetchOrgTree);
    const loading =useOrgStore((s)=>s.loading);
    const orgMap = useOrgStore((s) => s.orgMap);
    const rootIds = useOrgStore((s) => s.rootIds);
    const orgTree = useOrgStore((s) => s.orgTree);

    const [openEmp, setOpenEmp] = useState(null);
    
    // console.log("ORG TREE:", orgTree);
    
    useEffect(()=>{
        fetchOrgTree();
    },[]);

    if(loading) return <div className="text-sm text-gray-500">불러오는 중...</div>
    if(!orgMap || rootIds.length === 0){
      return <div className="text-sm text-gray-500">조직도 데이터가 없습니다.</div>
    }

    return (

    <div className="space-y-2">
      {rootIds.map((rootId) => (
        <OrgTreeNode key={rootId} nodeId={rootId} depth={0} onOpenEmp={setOpenEmp}/>
      ))}
        <EmployeeModal
          open={!!openEmp}
          employee={openEmp}
          onClose={() => setOpenEmp(null)}
        />
    </div>
  );
};
