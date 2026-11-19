// Conformance fixtures (SCHEMA.md §15): build each fixture's bundle, evaluate its plan and check
// the §15.1 assertions. The fixtures were derived by hand and never executed before this suite.
import { describe, expect, it } from 'vitest';
import { compareFixture } from '../src';
import type { Fixture } from './helpers/fixtures';
import { checkFixture, runFixture } from './helpers/fixtures';
import { listYaml, loadYaml } from './helpers/test-data';

describe('conformance fixtures', () => {
  for (const file of listYaml('fixtures')) {
    const fx = loadYaml(file) as Fixture;
    it(fx.id, () => {
      checkFixture(fx);
    });
  }

  it('reports each way a fixture is not met', () => {
    const fx = loadYaml('fixtures/n5-overshoot.yaml') as Fixture;
    const ev = runFixture(fx);
    const wrong: Fixture = {
      ...fx,
      expect: {
        nodes: { 'pool-b': { status: 'unmet', counted_uoc: 34 }, nope: { status: 'met' } },
        allocations: { b5: { primary: 'pool-b' } },
        not_counted: ['a4']
      }
    };
    expect(compareFixture(wrong, ev)).toEqual([
      'node pool-b: expected {"status":"unmet","counted_uoc":34}, got {"status":"met","counted_uoc":32}',
      'node nope: not found',
      'allocation b5: expected {"primary":"pool-b"}, got {"primary":"free-electives"}',
      'not_counted: expected ["a4"], got []'
    ]);
  });
});
