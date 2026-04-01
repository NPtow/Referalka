import { spawnSync } from "node:child_process";

function run(command, args, env) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const testPostgresUrl = process.env.TEST_POSTGRES_URL;

if (!testPostgresUrl) {
  console.error("TEST_POSTGRES_URL is required for local e2e tests.");
  process.exit(1);
}

const localBaseURL = process.env.PLAYWRIGHT_LOCAL_BASE_URL || "http://127.0.0.1:4010";
const env = {
  ...process.env,
  NODE_ENV: "development",
  POSTGRES_URL: testPostgresUrl,
  BETTER_AUTH_URL: localBaseURL,
  PLAYWRIGHT_LOCAL_BASE_URL: localBaseURL,
  EMAIL_TRANSPORT_MODE: "mock",
};

run("npx", ["prisma", "migrate", "deploy"], env);
run("npx", ["playwright", "test", "tests/e2e/app-flow.spec.ts"], env);
