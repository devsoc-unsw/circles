// The parse-level lines of test-data/negative/expected.txt. Strings are read from the vendored
// YAML (never copied here) so upstream edits are noticed. Schema, cross-reference and lint lines
// are M2/M8 work.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ParseErrorCode } from '../src';
import { analyzeSelector, parseCondition, parseCoreItem, ParseError } from '../src';
import { loadYaml, TEST_DATA } from './helpers/test-data';

const DOCS = 'negative/docs/2026';

// `requirements[3].courses[0]`, `courses.COMP2521.requires`
const get = (v: unknown, path: string): unknown =>
  path
    .split(/\.|(?=\[)/)
    .map((seg) => (seg.startsWith('[') ? Number(seg.slice(1, -1)) : seg))
    .reduce<unknown>((x, k) => (x as Record<string | number, unknown>)[k], v);

const read = (file: string, path: string): string => {
  const v = get(loadYaml(`${DOCS}/${file}`), path);
  if (typeof v !== 'string') throw new Error(`${file} ${path} is not a string`);
  return v;
};

const expected = readFileSync(join(TEST_DATA, 'negative', 'expected.txt'), 'utf8');

const cases: [string, string, 'selector' | 'condition' | 'item', ParseErrorCode, string][] = [
  ['bad.yaml', 'requirements[0].from', 'selector', 'MIXED_AND_OR', 'mixed "and"/"or"'],
  ['bad.yaml', 'requirements[3].courses[0]', 'item', 'BAD_CORE_ITEM', 'bad core item'],
  [
    'bad.yaml',
    'requirements[4].require',
    'condition',
    'UNEXPECTED_END',
    'unexpected end of selector'
  ],
  [
    'bad-2.yaml',
    'requirements[5].require',
    'condition',
    'IN_INSIDE_CORES',
    'in: is not allowed inside cores()'
  ],
  [
    'bad-2.yaml',
    'requirements[6].require',
    'condition',
    'MARK_OUT_OF_RANGE',
    'wam() mark 999 is above 100'
  ],
  [
    'bad-conditions.yaml',
    'courses.COMP2521.requires',
    'condition',
    'MARK_OUT_OF_RANGE',
    'grade() mark 120 is above 100'
  ]
];

const PARSE = {
  selector: (s: string) => analyzeSelector(s),
  condition: (s: string) => parseCondition(s),
  item: (s: string) => parseCoreItem(s)
};

describe('negative self-test (parse errors)', () => {
  it.each(cases)('%s %s', (file, path, kind, code, substring) => {
    expect(expected).toContain(substring);
    const src = read(file, path);
    let error: unknown;
    try {
      PARSE[kind](src);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(ParseError);
    expect((error as ParseError).code).toBe(code);
    expect((error as ParseError).message).toContain(substring);
  });

  it('parses in:a and @nope; their context errors are M8', () => {
    const a = analyzeSelector(read('bad.yaml', 'requirements[1].from'));
    expect(a.refs.map((r) => `${r.kind}:${r.name}`)).toEqual(['in:a']);
    const b = analyzeSelector(read('bad.yaml', 'requirements[2].from'));
    expect(b.refs.map((r) => `${r.kind}:${r.name}`)).toEqual(['set:nope']);
  });
});
