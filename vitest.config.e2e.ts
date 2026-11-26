// Load the TEST database settings before anything else, so e2e tests never touch the dev/prod DB
process.loadEnvFile('.env.test');

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
