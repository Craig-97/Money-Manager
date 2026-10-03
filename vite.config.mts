import { defineConfig } from 'vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';

// The dev server proxies /graphql to the API, the local one by default
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  optimizeDeps: {
    include: ['@apollo/client']
  },
  build: {
    outDir: 'build'
  },
  server: {
    proxy: {
      '/graphql': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]
});
