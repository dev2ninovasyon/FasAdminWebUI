import { defineConfig } from "@playwright/test";

const isolatedPort = process.env.PLAYWRIGHT_PORT;
const port = isolatedPort || "3002";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`,
    channel: "chrome",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: isolatedPort ? `npx next dev -p ${port} --webpack` : "npm run dev",
    url: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`,
    reuseExistingServer: !isolatedPort,
    timeout: 120_000,
  },
});
