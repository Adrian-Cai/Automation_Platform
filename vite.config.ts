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
      reporter: ['text', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/components/ui/**', // shadcn/ui 组件由库自身保证，项目内只做集成使用
        'src/**/mock.ts',
        'src/**/types.ts',
      ],
      thresholds: {
        // FIXME: 当前为过渡期基准值。前端遗留代码缺少测试，全局覆盖率约 7%。
        // 目标：随着测试补充逐步提升，最终达到 lines/functions/statements >= 80%, branches >= 75%
        lines: 5,
        functions: 3,
        branches: 5,
        statements: 5,
      },
    },
  },
})
