import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  optimizeDeps: {
    disabled: false, // https://github.com/vitejs/vite/issues/9703
  },
  build: {
    commonjsOptions: { include: [] },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['**.json'],
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
      include: ['lib/**'],
      exclude: ['lib/dynamode.ts', 'lib/index.ts', '**/types.ts'],
      all: true,
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
});
