/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // ⬇️ 여기에 js, jsx를 꼭 포함시켜야 합니다!
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}