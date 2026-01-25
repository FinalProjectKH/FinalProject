import { AuthProvider, AuthContext } from "./components/AuthContext";
import MyCalendar from "./pages/Calendar";
import { BrowserRouter } from 'react-router-dom';
import { useContext } from "react";
import Main from "./pages/Main";

function App() {
  return (
    <>
    <BrowserRouter>
    <AuthProvider>
     <AppComponent />
    </AuthProvider>    
    </BrowserRouter>

    </>
  );
}



function AppComponent() {
  const { user } = useContext(AuthContext);

  return (
    <>
      { user ? (
        <div className='body-container'>
          {/* 2️⃣ 여기 있던 BrowserRouter 제거 */}
          {/* 이미 밖에서 감쌌으니 Main만 부르면 됨 */}
          <Main /> 
        </div>
      ) : (
        <div className='login-section'>
          {/* 3️⃣ 이제 LoginPage도 라우터 안에 있으니 useNavigate 사용 가능! */}
          <LoginPage />
        </div>
      )}
    </>
  );
}


export default App;