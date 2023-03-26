// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from "path";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'qroll',
      fileName: 'qroll',
    },
  },
  plugins: [dts()],
  css: {
    modules: {
      scopeBehaviour: 'global'
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    },
  },
});