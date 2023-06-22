import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: 'src',
    exclude: ['**/node_modules/**', '**/dist/**', 'src/**/*.types.ts', 'src/vitest-setup.ts'],
    coverage: { exclude: ['vitest-setup.ts', '**/types.ts', '**/*.spec.ts', '**/*.types.ts'] },
    setupFiles: ['vitest-setup.ts'],
  },
});
