// `npm run bench`: the timing runs in test/*.bench.ts, kept out of `npm test` so CI stays stable.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.bench.ts'],
    testTimeout: 120000
  }
});
