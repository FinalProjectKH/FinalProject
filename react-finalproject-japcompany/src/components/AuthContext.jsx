import { createContext, useState, useEffect } from "react"; // useEffect 추가 필수!
import { axiosApi } from "../api/axiosAPI";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. 상태 초기화
  const [user, setUser] = useState(() => {
    const storeUser = localStorage.getItem("userData");
    return storeUser ? JSON.parse(storeUser) : null;
  });

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const changeInputId = (e) => {
    setId(e.target.value);
  }

  const changeInputPw = (e) => {
    setPassword(e.target.value);
  }

  // 2. 로그인 처리 함수
  const handleLogin = async (inputId, inputPassword) => {
    try {
      // 🚨 백엔드 DTO 변수명(empId, empPw)이 맞는지 꼭 확인하세요!
      const response = await axiosApi.post("/login", {
        empId: inputId,
        empPw: inputPassword,
      });

      const empInfo = response.data; 

      if (!empInfo) {
        alert("아이디 혹은 비밀번호 불일치");
        return false;
      }

      // 🚨 [핵심 수정] 변수명 통일! ("loginEmpNo")
      localStorage.setItem("userData", JSON.stringify(empInfo));
      
      // CalendarPage가 "loginEmpNo"를 찾으므로, 저장할 때도 이 이름이어야 합니다.
      localStorage.setItem("loginEmpNo", empInfo.empNo); 
      localStorage.setItem("authorityLevel", empInfo.authorityLevel); 

      setUser(empInfo);
      
      // 타이머 시작
      setupAutoLogout(); 

      return true; 

    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 처리 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 3. 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await axiosApi.get("/logout");
    } catch (error) {
      console.log("로그아웃 요청 에러(무시):", error);
    } finally {
      // 🚨 [핵심 수정] 저장했던 이름 그대로 삭제
      localStorage.removeItem("userData");
      localStorage.removeItem("loginEmpNo"); // loginEmpNo 삭제
      localStorage.removeItem("authorityLevel");
      
      setUser(null);
      window.location.href = "/"; 
    }
  };

  // 4. [추가됨] 누락되었던 자동 로그아웃 함수 정의
  const setupAutoLogout = () => {
    setTimeout(() => {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      handleLogout();
    }, 60 * 60 * 1000); // 1시간
  };

  // 5. [추가됨] 새로고침 시에도 타이머 돌아가게 설정
  useEffect(() => {
    if (user) {
      setupAutoLogout();
    }
  }, [user]);

  const globalState = {
    user,
    id,
    password,
    changeInputId,
    changeInputPw,
    handleLogin,
    handleLogout
  }

  return (
    <AuthContext.Provider value={globalState}>
      {children}
    </AuthContext.Provider>
  )
}