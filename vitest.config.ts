import { defineConfig } from "vitest/config";

// Integration tests need a throwaway Postgres database. Point TEST_DATABASE_URL
// at one (e.g. a local Postgres or a scratch Supabase project) to enable them.
// When it is unset, only the pure unit tests run, so `npm test` stays green
// without any database.
const testDbUrl = process.env.TEST_DATABASE_URL;

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    globalSetup: ["test/global-setup.ts"],
    // Share one database across files, so run them serially to avoid
    // cross-file interference.
    fileParallelism: false,
    env: testDbUrl
      ? { DATABASE_URL: testDbUrl, DIRECT_URL: testDbUrl }
      : {},
  },
});
