import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        "/employee": {
          target: env.VITE_BASE_URL || 'http://localhost', 
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
        "/myPage": {
          target: env.VITE_BASE_URL || 'http://localhost',
          changeOrigin: true,
        },
        "/api": {
          target: env.VITE_BASE_URL || 'http://localhost',
          changeOrigin: true,
        },
        "/uploads": {
          target: env.VITE_BASE_URL || 'http://localhost',
          changeOrigin: true,
        },
        "/admin": {
          target: env.VITE_BASE_URL || 'http://localhost',
          changeOrigin: true,
        },
      },
    },
  };
});