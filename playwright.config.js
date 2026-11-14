// @ts-check
const { defineConfig } = require('@playwright/test');
const VIEWPORTS = require('./tests/layout/viewports');

const PORT = process.env.HB_TEST_PORT || '4173';
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Minimal Node tooling for local dev/CI only — the GitHub Pages build itself
// is served as plain static files and needs none of this (see DEVELOPMENT.md).
module.exports = defineConfig({
  testDir: './tests/layout',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  // All transient run output lives under test-results/ (gitignored). The
  // one tracked, "approved" artifact set lives under tests/layout/baseline/
  // and is only touched by `npm run test:layout:update` — see that
  // directory's README for how to regenerate it.
  outputDir: 'test-results/artifacts',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // The spec captures its own named screenshots as artifacts (see
    // captureArtifacts() in tests/layout/helpers.js) rather than relying on
    // Playwright's per-step auto-screenshot, so this stays off.
    screenshot: 'off',
    // Normally unset — Playwright resolves Chromium from its own managed
    // browser cache (after a one-time `npx playwright install chromium`).
    // Only set PLAYWRIGHT_CHROMIUM_EXECUTABLE if you're pointing at a
    // browser binary already installed somewhere non-standard.
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } }
      : {}),
  },
  webServer: {
    command: `npx http-server . -p ${PORT} -a 127.0.0.1 -s -c-1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: VIEWPORTS.map(vp => ({
    name: vp.name,
    use: { viewport: { width: vp.width, height: vp.height } },
  })),
});
