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
      provider: 'v8',
      reporter: ['text', 'html', 'lcovonly'],
      include: ['lib/**'],
      exclude: ['lib/module.ts', 'lib/index.ts', '**/types.ts'],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    typecheck: {
      checker: 'tsc',
      include: ['tests/types/**/*.ts'],
      exclude: ['node_modules/**'],
      tsconfig: 'tests/tsconfig.json',
      ignoreSourceErrors: true,
    },
    hookTimeout: 30000,
  },
});
