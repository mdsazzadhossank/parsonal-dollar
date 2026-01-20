import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This ensures assets are linked relatively (e.g. "assets/index.js" instead of "/assets/index.js")
  build: {
    outDir: 'dist',
  },
});