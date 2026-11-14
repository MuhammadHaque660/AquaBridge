import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// VITE_BASE and VITE_OUT_DIR are set by tools/build-site.js so the deployed copy lives at /prototype/.
// Locally `npm run dev` serves the app at /.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  // Lets the team reference pages read the backlog in ../planning.
  server: { fs: { allow: ['..'] } },
  build: { outDir: process.env.VITE_OUT_DIR || 'dist', emptyOutDir: true },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.js', globals: true },
});
