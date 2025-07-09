import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: 'http://34.57.197.188:8087',
=======
        target: 'http://34.171.115.156:8087',
>>>>>>> 40d12a7035a0ddbcbada12cb02c88c18186b0573
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
      '/api/v1/projectAllocations': {
        target: 'http://34.171.115.156:8087',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
