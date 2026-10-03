import path from 'path';
import { defineConfig } from 'vite';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  test: {
    globals: true,
    testTimeout: 15000,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Styles don't affect behaviour under jsdom, so skip processing them
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        'src/test/**',
        'src/graphql/generated/**'
      ]
    },
    alias: {
      '~': path.resolve(import.meta.dirname, './src')
    }
  }
});
