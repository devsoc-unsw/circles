// M8: the semantic validator reproduces tools/negative exactly (every expected line matches one
// reported error or lint, nothing else), and the example corpus, positive docs and fixtures are clean.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  checkDocs,
  checkDocumentSchema,
  checkFixture,
  checkFixtureSchema,
  formatDiagnostic,
  parseYaml
} from '../src';
import { listYaml, TEST_DATA } from './helpers/test-data';

const read = (rel: string) =>
  parseYaml(readFileSync(join(TEST_DATA, rel), 'utf8')) as Record<string, unknown>;
const docsIn = (dir: string) => listYaml(dir).map((file) => ({ file, d: read(file) }));
const fixtureErrors = (dir: string) =>
  listYaml(dir).flatMap((f) => {
    const fx = read(f);
    const shape = checkFixtureSchema(fx);
    if (shape !== null) return [`${f}: fixture schema: ${shape}`];
    return checkFixture(f, fx, (p) => (existsSync(join(TEST_DATA, p)) ? read(p) : undefined)).map(
      formatDiagnostic
    );
  });

describe('semantic validation (§11 layer 3)', () => {
  it('finds nothing wrong in the examples, positive documents and fixtures', () => {
    const ex = checkDocs(docsIn('examples'));
    expect(ex.errors.map(formatDiagnostic)).toEqual([]);
    expect(ex.warnings.filter((w) => w.message.includes(': lint: ')).map(formatDiagnostic)).toEqual(
      []
    );
    expect(checkDocs(docsIn('positive')).errors.map(formatDiagnostic)).toEqual([]);
    expect(fixtureErrors('fixtures')).toEqual([]);
  });

  it('reproduces tools/negative/expected.txt exactly', () => {
    const docs = docsIn('negative/docs');
    const { errors, warnings } = checkDocs(docs);
    // layer 1 (schema) in validate.mjs wording, so the whole file can be matched
    const schema = docs.flatMap(({ file, d }) => {
      const m = checkDocumentSchema(d);
      return m === null ? [] : [`${file}: schema: ${m}`];
    });
    const unmatched = new Set([
      ...schema,
      ...errors.map(formatDiagnostic),
      ...fixtureErrors('negative/fixtures')
    ]);
    const lints = new Set(
      warnings.filter((w) => w.message.includes(': lint: ')).map((w) => w.message)
    );
    const expected = readFileSync(join(TEST_DATA, 'negative', 'expected.txt'), 'utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'));
    const missing: string[] = [];
    for (const x of expected) {
      const isWarn = x.startsWith('warn: ');
      const needle = x.replace(/^warn: /, '');
      const pool = isWarn ? lints : unmatched;
      const hit = [...pool].find((e) => e.includes(needle));
      if (hit) pool.delete(hit);
      // compact-string parse errors (layer 2) are the loader's: covered by test/load.test.ts
      else if (!/: (selector|condition) "/.test(x)) missing.push(x);
    }
    expect(missing).toEqual([]);
    expect([...unmatched]).toEqual([]);
    expect([...lints]).toEqual([]);
  });
});
