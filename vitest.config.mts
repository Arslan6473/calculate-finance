import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Resolves the `@/*` alias from tsconfig.json natively.
    tsconfigPaths: true,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
