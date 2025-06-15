// ✅ Vite projesi için düzgün çalışan config
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  server: {
    port: 3000,
    proxy: {
      '/subscribe': {
        target: 'http://localhost:3001', // Backend portu
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
