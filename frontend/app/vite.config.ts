import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.ts',
        'src/main.tsx',
        'src/types.ts',
        'src/counter.ts',
        'src/lib/api.ts',
        'src/tests/**/*',
        '**/*.config.*',
        'vite.config.ts',
      ],
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
});
