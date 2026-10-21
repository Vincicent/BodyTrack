import { defineConfig, devices } from '@playwright/test';

// Web E2E (lesson 14): the exported build, served with the same headers as production.
export default defineConfig({
  testDir: './e2e-web',
  fullyParallel: false, // one browser database per test: keep them sequential
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:8090', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx expo export --platform web && node e2e-web/serve.mjs',
    url: 'http://localhost:8090',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
