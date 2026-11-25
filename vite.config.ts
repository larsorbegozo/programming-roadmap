import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base so the build works both locally and under a GitHub Pages sub-path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  worker: { format: 'es' },
  build: {
    // The in-browser TypeScript compiler is large; it is only downloaded when a TypeScript problem runs.
    chunkSizeWarningLimit: 4000,
  },
});
