import logo from "../assets/logo.jpg";


const LoginPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f3f3f3]">
      {/* (optional) background glow for stronger glassmorphism */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#D37545]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-28 h-[520px] w-[520px] rounded-full bg-[#6b3b1b]/20 blur-3xl" />

      {/* stage: desktop exact position, small screens centered */}
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

            {/* logo (placeholder) */}
            <img src="{logo}" className="h-[99px] w-[99px]" />

            {/* title */}
            <h1 className="relative text-[40px] lg:text-[44px] tracking-[2px] font-medium mb-[28px] lg:mb-[34px] text-black">
              로그인
            </h1>

            {/* form */}
            <div className="relative w-full max-w-[520px] flex flex-col gap-[18px]">
              <input
                type="text"
                placeholder="아이디"
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
                className="
                  mt-[14px]
                  h-[78px]
                  rounded-[28px]
                  bg-[#6b3b1b]
                  text-white
                  text-[28px]
                  shadow-[0_18px_34px_rgba(0,0,0,0.22)]
                  active:translate-y-[1px]
                "
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
