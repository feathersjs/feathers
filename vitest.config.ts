import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/**/src/**/*.{test,spec}.{js,ts,tsx,jsx}'],
    benchmark: {
      include: ['packages/**/src/**/*.bench.ts']
    },
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.{js,ts,tsx,jsx}'],
      exclude: [
        '**/*.test.{js,ts,tsx,jsx}',
        '**/*.spec.{js,ts,tsx,jsx}',
        '**/*.bench.ts',
        '**/node_modules/**',
        '**/lib/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/fixtures/**'
      ],
      reporter: ['text', 'html', 'lcov']
    }
  }
})
