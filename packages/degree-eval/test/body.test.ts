// Count parity with tools/validate.mjs over the vendored example body. Expected counts are read
// from test-data/SOURCE.json (written by sync-test-data), never hard-coded.
import { describe, expect, it } from 'vitest';
import type { Condition, Selector } from '../src';
import {
  astEqual,
  normalizeCondition,
  normalizeSelector,
  parseCondition,
  parseCoreItem,
  parseNodePath,
  parseSelector,
  printCondition,
  printCoreItem,
  printNodePath,
  printSelector
} from '../src';
import type { Doc, Site } from './helpers/sites';
import { collectSites, compactStrings, loadDocs, parseStats } from './helpers/sites';
import { readSource } from './helpers/test-data';

const parse = (kind: 'condition' | 'selector', src: string): Condition | Selector =>
  kind === 'condition' ? parseCondition(src) : parseSelector(src);

const print = (kind: 'condition' | 'selector', ast: Condition | Selector): string =>
  kind === 'condition' ? printCondition(ast as Condition) : printSelector(ast as Selector);

const label = (x: { file: string; where: string }) => `${x.file}: ${x.where}`;

// every site value normalises, and its canonical compact form parses back to the same AST
const checkStructured = (sites: Site[]) => {
  for (const s of sites) {
    if (s.kind === 'condition' || s.kind === 'exclude') {
      const { ast } = normalizeCondition(s.value);
      expect(astEqual(parseCondition(printCondition(ast)), ast), label(s)).toBe(true);
    }
    if (s.kind === 'selector') {
      const { ast } = normalizeSelector(s.value);
      expect(astEqual(parseSelector(printSelector(ast)), ast), label(s)).toBe(true);
    }
    if (s.kind === 'item') expect(printCoreItem(parseCoreItem(s.value as string))).toBe(s.value);
    if (s.kind === 'substitution') {
      const item = parseCoreItem(s.value as string, { allowPatterns: true });
      expect(printCoreItem(item)).toBe(s.value);
    }
    if (s.kind === 'nodepath') {
      expect(printNodePath(parseNodePath(s.value as string)), label(s)).toBe(s.value);
    }
  }
};

describe('example body', () => {
  const source = readSource();
  const docs: Doc[] = loadDocs('examples');
  const sites = collectSites(docs);
  const strings = compactStrings(sites);
  const items = sites.filter((s) => s.kind === 'item');

  it('loads every document validate.mjs validated', () => {
    expect(docs.length).toBe(source.validate.documents);
  });

  it('parses every string and item, matching the validate.mjs counts', () => {
    for (const s of strings) expect(() => parse(s.kind, s.src), label(s)).not.toThrow();
    for (const s of items) expect(() => parseCoreItem(s.value as string), label(s)).not.toThrow();

    const count = (pred: (x: { file: string }) => boolean) =>
      strings.filter(pred).length + items.filter(pred).length;
    const byDir = Object.fromEntries(
      ['2023', '2026', '2027', 'patches'].map((dir) => [
        dir,
        count((x) => x.file.startsWith(`examples/${dir}/`))
      ])
    );
    const changed = strings.filter((s) => print(s.kind, parse(s.kind, s.src)) !== s.src);
    // eslint-disable-next-line no-console
    console.log(
      `body: ${strings.length + items.length} parsed (${strings.filter((s) => s.kind === 'condition').length} conditions + ${strings.filter((s) => s.kind === 'selector').length} selectors + ${items.length} items), ${strings.length} round trips; by dir ${JSON.stringify(byDir)}; canonical print differs from source: ${changed.length}`
    );
    expect(strings.length + items.length).toBe(source.validate.parsed);
    expect(strings.length).toBe(source.validate.roundTrips);
    // the CLI's census agrees
    expect(parseStats(docs)).toEqual({
      parsed: source.validate.parsed,
      roundTrips: source.validate.roundTrips
    });
  });

  it('round-trips every string to an equal AST', () => {
    for (const s of strings) {
      const ast = parse(s.kind, s.src);
      expect(astEqual(parse(s.kind, print(s.kind, ast)), ast), label(s)).toBe(true);
    }
  });

  it('normalises every structured site value', () => {
    checkStructured(sites);
  });
});

describe('positive self-test documents', () => {
  const sites = collectSites(loadDocs('positive'));

  it('parse and normalise with zero errors, including every node-path form', () => {
    expect(sites.length).toBeGreaterThan(0);
    for (const s of compactStrings(sites))
      expect(() => parse(s.kind, s.src), label(s)).not.toThrow();
    checkStructured(sites);
    // node paths at path sites, plus those inside in: selectors and complete()
    const refPaths = sites.flatMap((s) => {
      if (s.kind === 'condition' || s.kind === 'exclude') return normalizeCondition(s.value).refs;
      if (s.kind === 'selector') return normalizeSelector(s.value).refs;
      return [];
    });
    const paths = [
      ...sites.filter((s) => s.kind === 'nodepath').map((s) => s.value as string),
      ...refPaths.filter((r) => r.kind === 'in' || r.kind === 'node').map((r) => r.name)
    ];
    for (const p of paths) expect(printNodePath(parseNodePath(p))).toBe(p);
    const forms = new Set(paths.map((p) => parseNodePath(p).form));
    expect([...forms].sort()).toEqual(['rel', 'root', 'spec']);
  });
});
