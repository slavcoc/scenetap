import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],  // Strict ESM output matching your Express/Next.js stack
  dts: true,        // Generates TypeScript definition files
  clean: true,      // Wipes the dist folder before rebuilding
  minify: true,     // Compresses file size
});