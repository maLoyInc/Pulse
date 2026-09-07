import { defineConfig, devices } from "@playwright/test";

/**
 * QA harness for the checks that a build and a type-check cannot answer:
 * real rendering in real engines, measured contrast, keyboard reachability and
 * interaction timing.
 *
 * It runs against the production build (`next start`), not the dev server, so
 * what is measured is what would ship.
 */
const PORT = Number(process.env.QA_PORT ?? 3100);
const BASE_URL = process.env.QA_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./qa",
  outputDir: "./qa/results/artifacts",
  /* Checks append their evidence as they go; these bracket the run. */
  globalSetup: "./qa/global-setup.ts",
  globalTeardown: "./qa/global-teardown.ts",
  /* Timing assertions are meaningless when browsers compete for the CPU. */
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: [
    ["list"],
    ["json", { outputFile: "qa/results/report.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    /* Deterministic rendering: the dataset is seeded, so screenshots differ
       only when the layout does. */
    timezoneId: "UTC",
    locale: "en-US",
    trace: "off",
    video: "off",
  },
  projects: [
    /* Engines. Chromium, Gecko and WebKit cover the three rendering engines
       behind Chrome/Edge, Firefox and Safari. */
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    /* Shipping builds, not just the bundled engines. */
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],
  webServer: process.env.QA_BASE_URL
    ? undefined
    : {
        /*
         * The binary directly, not `npx`: npx takes the npm cache lock, so a
         * concurrent install anywhere on the machine can stall the server past
         * this timeout and the whole run dies with a misleading message.
         */
        command: `node node_modules/next/dist/bin/next start --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
      },
});
