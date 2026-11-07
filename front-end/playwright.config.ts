import { defineConfig } from '@playwright/test';

const port = 4321;

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.e2e.ts',
  // Tests share one mock API, and switch its data set.
  workers: 1,
  forbidOnly: !!process.env['CI'],
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    launchOptions: { executablePath: process.env['PLAYWRIGHT_CHROMIUM_PATH'] || undefined },
  },
  webServer: [
    { command: 'node e2e/mock-api.mjs', port: 8080, reuseExistingServer: !process.env['CI'] },
    {
      command: `npx ng serve --port ${port} --no-open`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
