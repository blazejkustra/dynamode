import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**'],
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
      include: ['lib/**'],
      all: true,
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
});
