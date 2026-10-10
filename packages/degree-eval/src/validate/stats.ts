// The compact-string census of tools/validate.mjs: how many strings and core items parse, and how
// many strings survive parse → print → parse unchanged. Shared by the body test and the CLI, so the
// two cannot drift from validate.mjs's "N compact strings/items parsed; M round trips" line.
import { astEqual } from '../lang/ast';
import { parseCondition } from '../lang/condition';
import { parseCoreItem } from '../lang/core-item';
import { printCondition, printSelector } from '../lang/print';
import { parseSelector } from '../lang/selector';
import type { Site } from '../load/sites';
import { documentSites } from '../load/sites';

type Obj = Record<string, unknown>;

export interface FileDoc {
  file: string;
  d: Obj;
}

export interface FileSite extends Site {
  file: string;
}

export interface Compact {
  file: string;
  where: string;
  kind: 'condition' | 'selector';
  src: string;
}

// Every site of every document. Like validate.mjs, a document with `extends` is walked with its
// nearest ancestor's requirements.
export const collectSites = (docs: readonly FileDoc[]): FileSite[] => {
  const findDoc = (kind: unknown, code: unknown, year: number): FileDoc | undefined => {
    const c = docs.filter((x) => x.d.kind === kind && String(x.d.code) === String(code));
    const y = (x: FileDoc) => (typeof x.d.year === 'number' ? x.d.year : 0);
    return (
      c.find((x) => y(x) === year) ?? c.filter((x) => y(x) < year).sort((a, b) => y(b) - y(a))[0]
    );
  };
  const resolvedBase = (d: Obj | undefined): Obj | undefined => {
    let bd = d;
    while (bd && bd.extends && typeof bd.extends === 'object') {
      const { year } = bd.extends as { year?: unknown };
      bd = typeof year === 'number' ? findDoc(bd.kind, bd.code, year)?.d : undefined;
    }
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

export const compactStrings = (sites: readonly FileSite[]): Compact[] =>
  sites.flatMap(({ file, where, kind, value }) => {
    if (kind === 'selector') {
      return selectorStrings(value).map((src) => ({ file, where, kind, src }));
    }
    if (kind === 'condition' || kind === 'exclude') {
      return conditionStrings(value).map((s) => ({ file, where, ...s }));
    }
    return [];
  });

export interface ParseStats {
  parsed: number; // strings and core items that parse
  roundTrips: number; // strings whose canonical print parses back to an equal AST
}

export const parseStats = (docs: readonly FileDoc[]): ParseStats => {
  const sites = collectSites(docs);
  let parsed = 0;
  let roundTrips = 0;
  for (const s of compactStrings(sites)) {
    try {
      if (s.kind === 'condition') {
        const ast = parseCondition(s.src);
        parsed += 1;
        if (astEqual(parseCondition(printCondition(ast)), ast)) roundTrips += 1;
      } else {
        const ast = parseSelector(s.src);
        parsed += 1;
        if (astEqual(parseSelector(printSelector(ast)), ast)) roundTrips += 1;
      }
    } catch {
      // reported by the loader as a parse error
    }
  }
  for (const s of sites) {
    if (s.kind === 'item') {
      try {
        parseCoreItem(String(s.value));
        parsed += 1;
      } catch {
        // reported by the loader as a parse error
      }
    }
  }
  return { parsed, roundTrips };
};
