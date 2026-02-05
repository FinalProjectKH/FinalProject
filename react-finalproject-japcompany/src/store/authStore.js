// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosApi } from "../api/axiosAPI";

/**
 * Context(AuthProvider) 역할을 Zustand로 대체한 버전
 * - employee 전역 관리
 * - login/logout 액션 제공
 * - localStorage 자동 저장(persist)
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ====== State ====== */
      user: null,     // 로그인한 사원 정보
      isLogin: false,

      // 1. 새로고침 신호를 위한 상태 추가 (숫자가 바뀔 때마다 신호가 감)
      refreshTrigger: 0,
      setUser: (user) => set({ user, isLogin: !!user }),

      /* ====== Actions ====== */

      // 2. 신호를 발생시키는 액션 추가
      triggerRefresh: () => set((state) => ({ 
        refreshTrigger: state.refreshTrigger + 1 
      })),

      // 로그인
      login: async (empId, empPw) => {
        const response = await axiosApi.post("/employee/login", {
          empId: empId,
          empPw: empPw,
        });

        const employeeInfo = response.data;

        if (!employeeInfo || employeeInfo.length === 0) {
          throw new Error("INVALID_CREDENTIALS");
        }

        // 로그인 성공
        set({ user: employeeInfo, isLogin: true });

        localStorage.setItem("loginEmpNo", employeeInfo.empNo);
        localStorage.setItem("authorityLevel", employeeInfo.authorityLevel);
        localStorage.setItem("loginDeptCode", employeeInfo.deptCode);

        // 1시간 자동 로그아웃 타이머
        if (get()._logoutTimer) clearTimeout(get()._logoutTimer);

        const timer = setTimeout(() => {
          get().logout({ skipServer: true });
          alert("재로그인 해주세요~");
          window.location.href = "/";
        }, 60 * 60 * 1000);

        set({ _logoutTimer: timer });
      },

      // 로그아웃
      logout: async ({ skipServer = false } = {}) => {
        try {
          if (!skipServer) {
            await axiosApi.get("/employee/logout");
          }
        } finally {
          set({ user: null, isLogin: false });

          if (get()._logoutTimer) {
            clearTimeout(get()._logoutTimer);
            set({ _logoutTimer: null });
          }

          localStorage.removeItem("auth-store");
          localStorage.removeItem("loginEmpNo");
          localStorage.removeItem("authorityLevel");
        }
      },

      /* ====== Internal ====== */
      _logoutTimer: null,
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isLogin: state.isLogin,
      }),
    }
  )
);
