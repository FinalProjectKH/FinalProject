import {create} from "zustand";
import { axiosApi } from "../api/axiosAPI";

export const useOrgStore = create((set,get)=>({

    orgTree : [],
    loading: false,
    rootIds: [],
    orgMap: {},

    isFetched: false,
    

    //1.명단을 받기 => fetch -------------------------------------
    fetchOrgTree : async() => {

        if (get().isFetched || get().loading) return; // 중복 요청 방지

        set({ loading: true });

        try {
        const res = await axiosApi.post("/org/orgTree");

        // console.log("ORG RES:", res);
        // console.log("ORG status:", res.status);
        // console.log("ORG headers:", res.headers);
        console.log("ORG data:", res.data);
        
        set({ orgTree: Array.isArray(res.data) ? res.data : [], isFetched: true});
        
        //---------------------nomalize(정규화)

        //정규화 데이터 포함
        get().nomalizeOrgTree();

        //상하 관계 설정 포함
        get().linkOrgTree();

       //최상위 루트 기준 값 포함(회사 아이디)
        get().buildRoots();

        //-------------------------------------

        } catch (error) {
            console.error("조직도 조회 실패", error);
            set({ orgTree: [], isFetched: false });
        }finally {
            set({ loading: false });
        }
    },


    //2.  nomalize(정규화)  => 즉시 참조를 위함-----------------------------

    /*
    1단계 = 고유 아이디 만들기(부서번호, 직원 번호)
    2단계 = 직원번호·부서번호를 기준으로 저장소(orgMap)를 만들기
    3단계 = 부모 / 자식 필드 추가
    4단계 = 부모 / 자식 관계 연결
    5단계 = 루트 정리
    */ 

    nomalizeOrgTree : () => {
        const rawList = get().orgTree;   // 받아온 서버 데이터
        const orgMap = {};               // 정규화 저장소 ----->>const 지우기?
            
        // 프런트 상에 가데이터/임원 노드
        orgMap["COMPANY"] = {
            id: "COMPANY",
            type: "company",
            parent: null,
            children: [],
            data: { name: "회사" },
        };

        orgMap["EXEC"] = {
            id: "EXEC",
            type: "exec",
            parent: "COMPANY",
            children: [],
            data: { name: "임원" },
        };
        
        // 회사 아래에 임원 노드 먼저 달아두기
        orgMap["COMPANY"].children.push("EXEC");


        //2단계 + 3단계
        rawList.forEach((item) => {
          // 부서 노드 등록
          if (item.deptCode) {
            // 각 부서 별 중복 저장 방지
            if (!orgMap[item.deptCode]) { 
              orgMap[item.deptCode] = {
                id: item.deptCode,
                type: "dept",
                parent: null,
                children: [],
                data: {
                  deptCode: item.deptCode,
                  deptName: item.deptName,
                  parentDeptCode: item.parentDeptCode ?? null,
                },
              };
            }
          }
      
          // 직원 노드 등록
          if (item.empNo) {
            orgMap[item.empNo] = {
              id: item.empNo,
              type: "emp",
              parent: null,
              children: [],
              data: {
                empNo: item.empNo,
                empName: item.empName,
                empEmail: item.empEmail,
                empPhone: item.empPhone,

                deptCode: item.deptCode,
                deptName: item.deptName,

                positionCode: item.positionCode,
                positionName: item.positionName,
              },
            };
          }
        });
    
        // Zustand 상태 반영
        set({ orgMap });
        console.log("nomalizeOrgTree orgMap -> ",orgMap);
    },

    // 4단계: 부자 관계 연결
    linkOrgTree: () =>{
        const orgMap = { ...get().orgMap };
        if (Object.keys(orgMap).length === 0) return;

        // 기존의 children 배열들이 중복 push되지 않도록 로직 보강
        Object.values(orgMap).forEach(node => {
            if (node.id === "COMPANY") node.children = ["EXEC"];
            else if (node.id === "EXEC") node.children = [];
            else node.children = [];
        });

        Object.values(orgMap).forEach((node) => {
            //부서 -> 상위 부서, 하위 직원 연결
            if(node.type === "dept") {
                const parentDeptCode = node.data.parentDeptCode;
                if(parentDeptCode && orgMap[parentDeptCode]){// 회사 조직도에 포함된 부서만
                    node.parent = parentDeptCode;
                    orgMap[parentDeptCode].children.push(node.id);
                    //부모 노드를 찾고, 자식 노드의 id 추가
                }else{
                // 최상위 부서는 회사 아래로
                node.parent = "COMPANY";
                orgMap["COMPANY"].children.push(node.id);
                }
            }


         // 직원 -> 부서가 있으면 부서로, 없으면 EXEC로   
        if(node.type === "emp") {
            const deptCode = node.data.deptCode;
            if( deptCode && orgMap[deptCode]){
                node.parent = deptCode;
                orgMap[deptCode].children.push(node.id);
            }else {
            node.parent = "EXEC";
            orgMap["EXEC"].children.push(node.id);
            }
        }
        });

        set({orgMap});
        console.log("linkOrgTree orgMap -> ", orgMap);

    },

    //5단계 = 루트 정리
    buildRoots: () => {
        set({ rootIds: ["COMPANY"] });
        console.log("buildRoots rootIds ->", ["COMPANY"]);
    },

}));
