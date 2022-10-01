import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['lib/**'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
