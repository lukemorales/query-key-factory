import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: 'src',
    exclude: ['**/node_modules/**', '**/dist/**', 'src/**/types.ts', 'src/vitest-setup.ts'],
    coverage: { exclude: ['src/vitest-setup.ts', 'src/**/*.spec.ts', 'src/**/types.ts'] },
    setupFiles: ['src/vitest-setup.ts'],
  },
});
