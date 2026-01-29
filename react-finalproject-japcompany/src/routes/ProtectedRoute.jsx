import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const isLogin = useAuthStore((s) => s.isLogin);
  return isLogin ? children : <Navigate to="/" replace />;
}
