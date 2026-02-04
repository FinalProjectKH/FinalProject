import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 모드(development 등)에 맞는 .env 파일을 불러옵니다.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // '/employee' 로 시작하는 요청은 target으로 보냄
        "/employee": {
          target: env.VITE_BASE_URL || 'http://localhost', // .env가 없으면 localhost 사용
          changeOrigin: true,
        },
        "/org": {
          target: env.VITE_BASE_URL || 'http://localhost',
          changeOrigin: true,
        },
        "/mypage": {
          target: env.VITE_BASE_URL || 'http://localhost',
          changeOrigin: true,
        },
        "/api": {
          target: env.VITE_BASE_URL || 'http://localhost',
          changeOrigin: true,
        },
      },
    },
  };
});