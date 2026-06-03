/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@configs': path.resolve(__dirname, './configs'),
    },
  },
  css: {
    postcss: './configs/postcss.config.js',
  },
  build: {
    // 代码分割：将大型第三方库单独打包，利用浏览器缓存
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          if (id.includes('recharts')) {
            return 'chart-vendor';
          }
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux-vendor';
          }
          if (id.includes('lucide-react')) {
            return 'icon-vendor';
          }
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
        },
      },
    },
    // 提高警告阈值，避免误报
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['test_case/frontend/**/*.test.{ts,tsx}', 'test_case/backend/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
})
