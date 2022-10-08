import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'query key factory',
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  clean: true,
  sourcemap: true,
});
