import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: 'client',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/JS/__tests__/**/*.test.js'],
  },
})
