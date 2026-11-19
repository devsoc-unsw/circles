// `npm run build:cli` bundles the CLI and the package source into one Node ESM file. `yaml` stays
// a runtime dependency.
import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'cli/main.ts',
  platform: 'node',
  external: ['yaml', /^node:/],
  output: {
    file: 'dist/degree-eval.mjs',
    format: 'esm',
    banner: '#!/usr/bin/env node'
  }
});
