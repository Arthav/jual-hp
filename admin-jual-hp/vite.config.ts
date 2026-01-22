import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(() => {
  const target = process.env.VITE_API_TARGET || 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5174,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
        },
        '/uploads': {
          target: target,
          changeOrigin: true,
        },
      },
    },
  }
})
