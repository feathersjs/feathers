import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/**/src/**/*.{test,spec}.{js,ts,tsx,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.{js,ts,tsx,jsx}'],
      exclude: ['**/*.test.{js,ts,tsx,jsx}', '**/*.spec.{js,ts,tsx,jsx}', '**/node_modules/**', '**/lib/**', '**/dist/**', '**/*.d.ts', '**/fixtures/**'],
      reporter: ['text', 'html', 'lcov']
    }
  }
})
