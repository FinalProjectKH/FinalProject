import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,//내 PC 말고 다른 PC도 접속 가능
    proxy: {
      "/employee": {
        target: 'http://localhost',
        changeOrigin: true,
      },
        "/org": {
        target: 'http://localhost',
        changeOrigin: true,
      },
       "/mypage": {
        target: 'http://localhost',
        changeOrigin: true,
      },
        "/myPage": {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
});
