import { execSync } from "node:child_process";

// Runs once before the whole suite. When a test database is configured, sync the
// Prisma schema to it so integration tests have tables to work with.
export default function globalSetup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.warn(
      "\n[tests] TEST_DATABASE_URL not set — skipping database-backed tests.\n",
    );
    return;
  }

  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  });
}
