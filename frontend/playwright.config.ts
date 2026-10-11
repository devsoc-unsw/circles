import { defineConfig, devices } from '@playwright/test';

// End-to-end tests (e2e/*.e2e.ts) against a production build of the frontend and a running
// backend. The backend is not started here: in CI it is the ci-backend compose service, locally
// it is `docker compose up backend`. The frontend is built with the degree evaluator flag on.
// The backend's CORS allows localhost:3000 and :3001; locally :3000 is usually the dev container,
// so set E2E_PORT=3001.
const port = Number(process.env.E2E_PORT ?? 3000);
const api = process.env.E2E_API_URL ?? 'http://localhost:8000/';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['junit', { outputFile: 'junit/e2e-test-results.xml' }]]
    : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npx vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    env: {
      VITE_BACKEND_API_BASE_URL: api,
      VITE_DEGREE_EVAL: 'true'
    },
    timeout: 300_000,
    reuseExistingServer: false
  }
});
