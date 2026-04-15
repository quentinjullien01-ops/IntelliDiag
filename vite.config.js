import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/diag-ia/',  // ← ton nom de repo GitHub
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
