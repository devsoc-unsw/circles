// assignSpecs: a flat spec list (as the Circles planner stores it) placed into spec slots.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assignSpecs,
  createBundle,
  evaluate,
  loadDocuments,
  nodeAt,
  staticCatalogue
} from '../src';
import { listYaml, TEST_DATA } from './helpers/test-data';

const bundle = createBundle(
  loadDocuments(
    listYaml('examples').map((path) => ({
      path,
      text: readFileSync(join(TEST_DATA, path), 'utf8'),
      origin: 'repo' as const
    }))
  ).docs,
  staticCatalogue({}, { uoc: 6 })
);

describe('assignSpecs', () => {
  it('places a major and a minor in their slots', () => {
    expect(assignSpecs(bundle, '3778', 2026, ['COMPA1', 'MATHC2'])).toEqual({
      selections: { major: ['COMPA1'], minor: ['MATHC2'] },
      unplaced: []
    });
  });

  it('reports codes the program does not offer', () => {
    expect(assignSpecs(bundle, '3778', 2026, ['COMPA1', 'ACCTA1']).unplaced).toEqual(['ACCTA1']);
    expect(assignSpecs(bundle, 'nope', 2026, ['COMPA1']).unplaced).toEqual(['COMPA1']);
  });

  it('fills the first slot first, then the next one offering the code', () => {
    // 3409: `major` takes one major; a second major goes to `second-major`, which chooses that branch
    const { selections } = assignSpecs(bundle, '3409', 2026, ['ENGLC1', 'HISTD1']);
    expect(selections).toEqual({ major: ['ENGLC1'], 'second-major': ['HISTD1'] });
    const ev = evaluate(bundle, { program: '3409', year: 2026, selections, plan: [] });
    expect(nodeAt(ev, 'second-specialisation')?.selected).toEqual(['second-major']);
  });
});
