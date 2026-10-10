// The CLI's validation pass (validateSources): the census and clean result on the examples and
// fixtures, and every tools/negative expected line reported.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatDiagnostic, validateSources } from '../src';
import { listYaml, readSource, TEST_DATA } from './helpers/test-data';

const files = (dir: string) =>
  listYaml(dir).map((path) => ({ path, text: readFileSync(join(TEST_DATA, path), 'utf8') }));
const read = (p: string) =>
  existsSync(join(TEST_DATA, p)) ? readFileSync(join(TEST_DATA, p), 'utf8') : undefined;

describe('validateSources', () => {
  it('matches validate.mjs on the examples and fixtures', () => {
    const r = validateSources(files('examples'), files('fixtures'), read);
    const { validate } = readSource();
    expect(r.errors.map(formatDiagnostic)).toEqual([]);
    expect(r.documents).toBe(validate.documents);
    expect(r.fixtures).toBe(10);
    expect(r.stats).toEqual({ parsed: validate.parsed, roundTrips: validate.roundTrips });
  });

  it('reports every tools/negative expected line', () => {
    const r = validateSources(files('negative/docs'), files('negative/fixtures'), read);
    const reported = [...r.errors, ...r.warnings].map((d) => `${formatDiagnostic(d)}`);
    const expected = readFileSync(join(TEST_DATA, 'negative', 'expected.txt'), 'utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'))
      // layer 1 wording differs: the loader explains schema errors in plain words
      .filter((s) => !/: schema: /.test(s))
      .map((s) => s.replace(/^warn: /, ''));
    const missing = expected.filter((x) => {
      const [file = '', ...restParts] = x.split(': ');
      const rest = restParts.join(': ');
      return !reported.some((line) => line.includes(file) && line.includes(rest));
    });
    expect(missing).toEqual([]);
  });
});
