import {create} from "zustand";
import { axiosApi } from "../api/axiosAPI";

export const useOrgStore = create((set,get)=>({

    orgTree : [],
    loading: false,

    //1.명단을 받기 => fetch
    fetchOrgTree : async() => {
        if (get().loading) return; // 중복 요청 방지
        set({ loading: true });

        try {
        const res = await axiosApi.post("/org/orgTree");

        console.log("ORG RES:", res);
        console.log("ORG status:", res.status);
        console.log("ORG headers:", res.headers);
        console.log("ORG data:", res.data);
        
        set({ orgTree: Array.isArray(res.data) ? res.data : [] });
        
        } catch (error) {
            console.error("조직도 조회 실패", error);
            set({ orgTree: [] });
        }finally {
            set({ loading: false });
        }
    },

    //2. 고유한 키 / 즉시 참조 가능 => nomalize
    nomalizeOrgTree : () => {

    },

}));
