import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import reactRefresh from '@vitejs/plugin-react';

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
        target: 'https://craig-money-manager-api-pr-4.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  plugins: [
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {}
    }
  }
});