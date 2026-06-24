// vite.web.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  base: '/K8s-learn/',
  resolve: {
    alias: [
      {
        find: /.*\/shared\/ipc$/,
        replacement: resolve(__dirname, 'src/shared/ipc.web.ts'),
      },
    ],
  },
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
})
