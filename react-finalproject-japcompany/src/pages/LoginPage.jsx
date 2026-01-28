import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");     // 아이디(또는 이메일)
  const [password, setPassword] = useState(""); // 비밀번호
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await login(email, password);   // ✅ /employee/login 호출 (authStore.js)
      navigate("/main", { replace: true });
    } catch {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f3f3f3]">
      {/* (optional) background glow for stronger glassmorphism */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#D37545]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-28 h-[520px] w-[520px] rounded-full bg-[#6b3b1b]/20 blur-3xl" />

      {/* stage */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div
          className="
            relative
            w-[92vw] max-w-[722px] h-auto lg:w-[622px] lg:h-[540px]
            rounded-[26px]
            border border-white/20
            bg-white/10
            backdrop-blur-2xl
            shadow-[0_30px_60px_rgba(0,0,0,0.18)]
            px-[28px] py-[40px] lg:px-[64px] lg:py-[56px]
            flex flex-col items-center
          "
        >
          {/* subtle inner highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[26px] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />

          {/* logo */}
          <img src="/image/logo_02.png" className="h-[99px] w-[99px]" />

          {/* title */}
          <h1 className="relative text-[40px] lg:text-[44px] tracking-[2px] font-medium mb-[28px] lg:mb-[34px] text-black">
            로그인
          </h1>

          {/* form */}
          <form
            onSubmit={onSubmit}
            className="relative w-full max-w-[520px] flex flex-col gap-[18px]"
          >
            <input
              type="text"
              placeholder="아이디"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="
                h-[62px]
                rounded-full
                px-[26px]
                text-[18px]
                border border-white/30
                bg-white/20
                backdrop-blur-xl
                shadow-[0_14px_28px_rgba(0,0,0,0.14)]
                outline-none
                placeholder:text-black/60
                text-black
              "
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="
                h-[62px]
                rounded-full
                px-[26px]
                text-[18px]
                border border-white/30
                bg-white/20
                backdrop-blur-xl
                shadow-[0_14px_28px_rgba(0,0,0,0.14)]
                outline-none
                placeholder:text-black/60
                text-black
              "
            />

            <button
              type="submit"
              disabled={loading}
              className="
                mt-[14px]
                h-[78px]
                rounded-[28px]
                bg-[#6b3b1b]
                text-white
                text-[28px]
                shadow-[0_18px_34px_rgba(0,0,0,0.22)]
                active:translate-y-[1px]
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {loading ? "로그인 중..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
