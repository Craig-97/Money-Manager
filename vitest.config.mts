import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { configDefaults } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [react(), ...(process.env.REACT_COMPILER ? [babel({ presets: [reactCompilerPreset()] })] : [])],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [...(configDefaults.coverage.exclude ?? []), 'src/setupTests.ts']
    },
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  }
});
