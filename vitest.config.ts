import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setupTests.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        global: {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        './src/components/ui/': {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
        './src/lib/': {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
        './src/hooks/': {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
      },
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/mocks/**',
        '**/*.test.*',
        '**/*.spec.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
  resolve: {
    alias: { '@': '/src' },
  },
});
