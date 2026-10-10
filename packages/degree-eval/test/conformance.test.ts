// Conformance fixtures (SCHEMA.md §15): build each fixture's bundle, evaluate its plan and check
// the §15.1 assertions. The fixtures were derived by hand and never executed before this suite.
import { describe, it } from 'vitest';
import type { Fixture } from './helpers/fixtures';
import { checkFixture } from './helpers/fixtures';
import { listYaml, loadYaml } from './helpers/test-data';

describe('conformance fixtures', () => {
  for (const file of listYaml('fixtures')) {
    const fx = loadYaml(file) as Fixture;
    it(fx.id, () => {
      checkFixture(fx);
    });
  }
});
