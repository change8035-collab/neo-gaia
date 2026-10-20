import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' → GitHub Pages 같은 하위 경로에 올려도 그대로 동작
export default defineConfig({
  plugins: [react()],
  base: './',
  // 한글 폰트 조각을 CSS 안에 박아 넣지 않고 필요한 글자 조각만 따로 받게 함
  build: { assetsInlineLimit: 0 },
  server: { port: 8796, host: true },
})
