import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Đảm bảo đường dẫn tương đối để Vercel không bị lỗi 404 assets
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['xlsx', 'jspdf'],
          'vendor-charts': ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 2000
  }
});
