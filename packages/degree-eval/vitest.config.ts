import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 15000,
    reporters: ['default', 'junit'],
    outputFile: { junit: './junit/degree-eval-test-results.xml' }
  }
});
