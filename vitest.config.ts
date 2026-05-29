import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Load .env.test so process.env vars are available in tests
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [tsconfigPaths()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/unit/setup.ts'],
      include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
      env,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['lib/**', 'app/api/**'],
        exclude: ['lib/email.ts', 'lib/seed-data.ts'],
      },
    },
  }
})
