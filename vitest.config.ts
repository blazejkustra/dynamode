import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
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
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
});
