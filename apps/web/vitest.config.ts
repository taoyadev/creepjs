import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig.json keeps "jsx": "preserve" for Next.js. Vite 8 hands that to
  // oxc as-is, which leaves JSX untransformed, so compile it here instead.
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
