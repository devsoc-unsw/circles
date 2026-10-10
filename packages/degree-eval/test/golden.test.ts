// Golden traces (EVALUATOR.md §6): the three hand-traces in catalogue-reports/FIXES.md, written as
// §15 fixtures with the "after" expectations.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'vitest';
import YAML from 'yaml';
import type { Fixture } from './helpers/fixtures';
import { checkFixture } from './helpers/fixtures';

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'golden');

describe('golden traces', () => {
  for (const file of readdirSync(DIR)
    .filter((f) => f.endsWith('.yaml'))
    .sort()) {
    const fx = YAML.parse(readFileSync(join(DIR, file), 'utf8'), { merge: false }) as Fixture;
    it(fx.id, () => {
      checkFixture(fx);
    });
  }
});
