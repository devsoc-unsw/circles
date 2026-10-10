// Visits exactly the compact-string call sites of validate.mjs checkDocs (:360–439), so the body
// counts can be compared with its "compact strings/items parsed" and "round trips" numbers.
import type { Site as SrcSite } from '../../src';
import { documentSites } from '../../src';
import { listYaml, loadYaml } from './test-data';

export interface Site extends SrcSite {
  file: string;
}

interface DocData {
  kind?: string;
  code?: string | number;
  year?: number;
  extends?: { year: number };
  requirements?: unknown;
  [key: string]: unknown;
}

export interface Doc {
  file: string;
  d: DocData;
}

export const loadDocs = (dir: string): Doc[] =>
  listYaml(dir).map((file) => ({ file, d: loadYaml(file) as DocData }));

// Every site of every document. Like validate.mjs, a document with `extends` is walked with its
// ancestor's requirements (it has none of its own in the corpus).
export const collectSites = (docs: Doc[]): Site[] => {
  const findDoc = (kind: string | undefined, code: unknown, year: number): Doc | undefined => {
    const c = docs.filter((x) => x.d.kind === kind && String(x.d.code) === String(code));
    return (
      c.find((x) => x.d.year === year) ??
      c.filter((x) => (x.d.year ?? 0) < year).sort((a, b) => (b.d.year ?? 0) - (a.d.year ?? 0))[0]
    );
  };
  const resolvedBase = (d: DocData | undefined): DocData | undefined => {
    let bd = d;
    while (bd?.extends) bd = findDoc(bd.kind, bd.code, bd.extends.year)?.d;
    return bd;
  };
  return docs.flatMap(({ file, d }) =>
    documentSites(d, resolvedBase(d)?.requirements ?? d.requirements).map((s) => ({ file, ...s }))
  );
};

const firstEntry = (v: object): [string, unknown] => Object.entries(v)[0] ?? ['', undefined];

// Compact strings inside a selector value, recursing like validate.mjs checkSel.
export const selectorStrings = (v: unknown): string[] => {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(selectorStrings);
  if (!v || typeof v !== 'object') return [];
  const [k, val] = firstEntry(v);
  if (k === 'or' || k === 'and') return (val as unknown[]).flatMap(selectorStrings);
  if (k === 'not') return selectorStrings(val);
  return [];
};

// Compact strings inside a condition value, recursing like validate.mjs checkCond.
export const conditionStrings = (v: unknown): { kind: 'condition' | 'selector'; src: string }[] => {
  if (typeof v === 'string') return [{ kind: 'condition', src: v }];
  if (!v || typeof v !== 'object') return [];
  const [k, val] = firstEntry(v);
  const sel = (x: unknown) => selectorStrings(x).map((src) => ({ kind: 'selector' as const, src }));
  const inOf = (x: unknown) =>
    x && typeof x === 'object' ? (x as { in?: unknown }).in : undefined;
  if (k === 'and' || k === 'or') return (val as unknown[]).flatMap(conditionStrings);
  if (k === 'not') return conditionStrings(val);
  if (k === 'uoc' || k === 'wam' || k === 'grade')
    return inOf(val) === undefined ? [] : sel(inOf(val));
  if (k === 'cores' && val !== true) return sel(val);
  return [];
};
