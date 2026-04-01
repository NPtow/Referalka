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
  console.error("TEST_POSTGRES_URL is required for integration tests.");
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_ENV: "test",
  POSTGRES_URL: testPostgresUrl,
};

run("npx", ["prisma", "migrate", "deploy"], env);
run("npx", ["vitest", "run", "tests/integration"], env);
