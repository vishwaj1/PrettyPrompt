import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/content/content.tsx',
    'src/content/sw.ts'
  ],
  outDir: 'dist',
  format: 'iife',
  target: 'chrome110',
  splitting: false,
  sourcemap: false,
  clean: true
});
