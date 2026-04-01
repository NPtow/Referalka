import { defineConfig } from "@playwright/test";

const previewBaseURL = process.env.PLAYWRIGHT_PREVIEW_BASE_URL;
const localBaseURL = process.env.PLAYWRIGHT_LOCAL_BASE_URL || "http://127.0.0.1:4010";
const baseURL = previewBaseURL || localBaseURL;
const protectionBypass = process.env.PLAYWRIGHT_PROTECTION_BYPASS;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    extraHTTPHeaders: protectionBypass
      ? { "x-vercel-protection-bypass": protectionBypass }
      : undefined,
  },
  webServer: previewBaseURL
    ? undefined
    : {
      command: "npm run dev -- --hostname 127.0.0.1 --port 4010",
      url: localBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        BETTER_AUTH_URL: localBaseURL,
        EMAIL_TRANSPORT_MODE: process.env.EMAIL_TRANSPORT_MODE || "mock",
      },
    },
});
