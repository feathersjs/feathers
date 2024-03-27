import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    reporters: ['dot'],
    testTimeout: 30000,
    fileParallelism: false
  }
})
