// M2: loading (YAML limits, schema_version, origin), structure validation and parse checks.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Diagnostic, SourceFile } from '../src';
import {
  checkFixtureSchema,
  formatDiagnostic,
  loadDocuments,
  MAX_CHARS,
  parseYaml,
  YamlError
} from '../src';
import { SCHEMA_SHA256 } from '../src/validate';
import { formats } from '../src/validate/runtime';
import { listYaml, readSource, TEST_DATA } from './helpers/test-data';

const source = (rel: string, origin: SourceFile['origin'] = 'repo'): SourceFile => ({
  path: rel,
  text: readFileSync(join(TEST_DATA, rel), 'utf8'),
  origin
});

const errors = (ds: Diagnostic[]) => ds.filter((d) => d.level === 'error');

const PROGRAM = `schema_version: "1.0"
kind: program
code: "9999"
year: 2026
provenance: { source: hand }
title: Test program
uoc: 6
requirements:
  - id: core
    kind: core
    courses: [COMP1511]
`;

const yamlCode = (text: string) => {
  try {
    parseYaml(text);
  } catch (e) {
    if (e instanceof YamlError) return e.code;
    throw e;
  }
  return 'ok';
};

describe('loadDocuments over the vendored data', () => {
  it('loads every example document with no errors or warnings', () => {
    const files = listYaml('examples').map((f) => source(f));
    const { docs, diagnostics } = loadDocuments(files);
    expect(diagnostics.map(formatDiagnostic)).toEqual([]);
    expect(docs).toHaveLength(readSource().validate.documents);
  });

  it('loads the positive self-test documents cleanly', () => {
    const { docs, diagnostics } = loadDocuments(listYaml('positive').map((f) => source(f)));
    expect(diagnostics.map(formatDiagnostic)).toEqual([]);
    expect(docs.length).toBeGreaterThan(0);
  });

  it('reproduces the schema and parse errors of tools/negative/expected.txt', () => {
    // §11 layers 1–2 only: structure (schema) and compact-string parse errors. The remaining
    // expected lines are cross-reference checks and lints (M8).
    const layer12 = /: (fixture )?schema: |: (selector|condition) "|bad core item/;
    const expected = readFileSync(join(TEST_DATA, 'negative', 'expected.txt'), 'utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#') && !s.startsWith('warn: ') && layer12.test(s));

    const { diagnostics } = loadDocuments(listYaml('negative/docs').map((f) => source(f)));
    const reported = errors(diagnostics).map(formatDiagnostic);
    for (const f of listYaml('negative/fixtures')) {
      const m = checkFixtureSchema(parseYaml(readFileSync(join(TEST_DATA, f), 'utf8')));
      if (m !== null) reported.push(`${f}: fixture schema: ${m}`);
    }

    // every expected line matches exactly one reported error, and nothing else is reported
    const unmatched = new Set(reported);
    const missing = expected.filter((x) => {
      const hit = [...unmatched].find(
        (e) => e.includes(x.replace(/^[^:]+: /, '')) && e.includes(x.split(':')[0] as string)
      );
      if (hit) unmatched.delete(hit);
      return !hit;
    });
    expect(expected.length).toBeGreaterThanOrEqual(9);
    expect(missing).toEqual([]);
    expect([...unmatched]).toEqual([]);
  });

  it('leaves documents with errors out of `docs`', () => {
    const { docs } = loadDocuments(listYaml('negative/docs').map((f) => source(f)));
    expect(docs.map((d) => d.file)).not.toContain('negative/docs/2026/bad.yaml');
  });

  it('validators are generated from the vendored schema.json (npm run build-validators)', () => {
    expect(SCHEMA_SHA256).toBe(readSource().files['schema.json']);
  });
});

describe('YAML limits (SCHEMA.md §2.1)', () => {
  it('rejects oversized input, merge keys, alias bombs and bad syntax', () => {
    expect(yamlCode(`a: "${'x'.repeat(MAX_CHARS)}"`)).toBe('YAML_TOO_LARGE');
    expect(yamlCode('base: &b { x: 1 }\nother:\n  <<: *b\n')).toBe('YAML_MERGE_KEY');
    const bomb = ['a: &a [x, x, x, x, x, x, x, x, x, x]'];
    for (let i = 1; i < 6; i++)
      bomb.push(
        `${'abcdef'[i]}: &${'abcdef'[i]} [${Array(10)
          .fill(`*${'abcdef'[i - 1]}`)
          .join(', ')}]`
      );
    expect(yamlCode(bomb.join('\n'))).toBe('YAML_ALIASES');
    expect(yamlCode('a: [1, 2')).toBe('YAML_SYNTAX');
    expect(yamlCode(PROGRAM)).toBe('ok');
  });

  it('reports a YAML error as a diagnostic and skips the file', () => {
    const { docs, diagnostics } = loadDocuments([
      { path: 'x.yaml', text: 'a: [1, 2', origin: 'local' }
    ]);
    expect(docs).toEqual([]);
    expect(diagnostics[0]).toMatchObject({ file: 'x.yaml', level: 'error', code: 'YAML_SYNTAX' });
  });
});

describe('schema_version (SCHEMA.md §10) and origin', () => {
  const load = (text: string, origin: SourceFile['origin'] = 'repo') =>
    loadDocuments([{ path: 'p.yaml', text, origin }]);

  it('loads a 1.0 document strictly', () => {
    const { docs, diagnostics } = load(PROGRAM);
    expect(diagnostics).toEqual([]);
    expect(docs[0]).toMatchObject({
      kind: 'program',
      lenient: false,
      schemaVersion: { major: 1, minor: 0 }
    });
  });

  it('rejects a different major version', () => {
    const { docs, diagnostics } = load(PROGRAM.replace('"1.0"', '"2.0"'));
    expect(docs).toEqual([]);
    expect(diagnostics[0]?.code).toBe('SCHEMA_VERSION_UNSUPPORTED');
  });

  it('rejects unknown fields in a known minor version', () => {
    const { docs, diagnostics } = load(`${PROGRAM}future_field: 1\n`);
    expect(docs).toEqual([]);
    expect(errors(diagnostics)[0]?.message).toContain(
      'must NOT have additional properties (future_field)'
    );
  });

  it('loads a newer minor version leniently', () => {
    // a 1.3 document: an unknown top-level field, an unknown node kind and an unknown atom
    const text = `${PROGRAM.replace('"1.0"', '"1.3"')}  - id: new-rule
    kind: quorum
    title: Something new
  - id: entry-check
    kind: check
    require: "COMP1511 and newatom(3)"
future_field: 1
`;
    const { docs, diagnostics } = load(text);
    expect(errors(diagnostics)).toEqual([]);
    const [doc] = docs;
    expect(doc?.lenient).toBe(true);
    const reqs = doc?.data.requirements as Record<string, unknown>[];
    expect(reqs[1]).toMatchObject({
      id: 'new-rule',
      kind: 'info',
      confirm: true,
      title: 'Something new'
    });
    expect(diagnostics.map((d) => d.code).sort()).toEqual([
      'LENIENT_NODE_KIND',
      'LENIENT_UNKNOWN_ATOM',
      'SCHEMA_LENIENT'
    ]);
  });

  it('marks a locally loaded file as provenance.source local', () => {
    const { docs } = load(PROGRAM, 'local');
    expect(docs[0]?.data.provenance).toEqual({ source: 'local' });
    expect(load(PROGRAM).docs[0]?.data.provenance).toEqual({ source: 'hand' });
  });

  it('reports a parse error at its validate.mjs location', () => {
    const text = `${PROGRAM}  - id: free
    kind: pool
    uoc: 6
    from: { and: ["COMP**** or MATH****", "level:3 and"] }
`;
    const { docs, diagnostics } = load(text);
    expect(docs).toEqual([]);
    expect(errors(diagnostics).map(formatDiagnostic)).toEqual([
      'p.yaml: requirements[1].from.and[1]: selector "level:3 and": unexpected end of selector'
    ]);
  });
});

describe('format checks used by the generated validators', () => {
  it('date requires a real calendar day', () => {
    expect(formats.date.validate('2024-02-29')).toBe(true);
    expect(formats.date.validate('2023-02-29')).toBe(false);
    expect(formats.date.validate('2026-13-01')).toBe(false);
    expect(formats.date.validate('2026-1-01')).toBe(false);
  });

  it('uri requires a scheme and no spaces', () => {
    expect(formats.uri('https://www.handbook.unsw.edu.au/undergraduate/programs/2026/3778')).toBe(
      true
    );
    expect(formats.uri('www.handbook.unsw.edu.au')).toBe(false);
    expect(formats.uri('https://a b')).toBe(false);
  });
});
