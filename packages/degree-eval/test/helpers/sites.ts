// Visits exactly the compact-string call sites of validate.mjs checkDocs (:360–439), so the body
// counts can be compared with its "compact strings/items parsed" and "round trips" numbers.
import { RX } from '../../src/lang/patterns';
import { listYaml, loadYaml } from './test-data';

export type SiteKind = 'condition' | 'selector' | 'item' | 'substitution' | 'nodepath';

export interface Site {
  file: string;
  where: string;
  kind: SiteKind;
  value: unknown;
}

interface Node {
  id?: string;
  kind?: string;
  children?: Node[];
  from?: unknown;
  quotas?: { from?: unknown }[];
  applies_to?: unknown;
  require?: unknown;
  courses?: unknown;
  scope?: string;
  counts_toward?: (string | { node: string; courses?: unknown })[];
  distinct_from?: { node: string }[];
}

interface DocData {
  kind?: string;
  code?: string | number;
  year?: number;
  extends?: { year: number };
  requirements?: Node[];
  sets?: Record<string, unknown>;
  shares?: { between?: string[]; courses?: unknown; replacement?: { from?: unknown } }[];
  substitutions?: { with?: string; scope?: string; when?: unknown }[];
  exemptions?: { scope?: string; when?: unknown }[];
  entry?: unknown;
  allowed_if?: unknown;
  classes?: { require?: unknown }[];
  courses?: Record<string, { requires?: unknown; excludes?: unknown[] }>;
  ops?: { target?: string; fields?: { requires?: unknown } }[];
}

export interface Doc {
  file: string;
  d: DocData;
}

export const loadDocs = (dir: string): Doc[] =>
  listYaml(dir).map((file) => ({ file, d: loadYaml(file) as DocData }));

export const collectSites = (docs: Doc[]): Site[] => {
  const findDoc = (kind: string | undefined, code: unknown, year: number): Doc | undefined => {
    const c = docs.filter((x) => x.d.kind === kind && String(x.d.code) === String(code));
    return (
      c.find((x) => x.d.year === year) ??
      c.filter((x) => (x.d.year ?? 0) < year).sort((a, b) => (b.d.year ?? 0) - (a.d.year ?? 0))[0]
    );
  };
  // docs with `extends` are checked against the ancestor's requirements (validate.mjs resolvedBase)
  const resolvedBase = (d: DocData | undefined): DocData | undefined => {
    let bd = d;
    while (bd?.extends) bd = findDoc(bd.kind, bd.code, bd.extends.year)?.d;
    return bd;
  };

  const sites: Site[] = [];
  for (const { file, d } of docs) {
    const add = (kind: SiteKind, where: string, value: unknown) =>
      sites.push({ file, where, kind, value });
    const nodes: [Node, string][] = [];
    const collect = (list: Node[] | undefined, path: string) =>
      (list ?? []).forEach((n, i) => {
        if (!n || typeof n !== 'object') return;
        nodes.push([n, `${path}[${i}]`]);
        if (n.kind === 'group') collect(n.children, `${path}[${i}].children`);
      });
    collect(resolvedBase(d)?.requirements ?? d.requirements, 'requirements');

    for (const [n, p] of nodes) {
      if (n.kind === 'pool') {
        add('selector', `${p}.from`, n.from);
        (n.quotas ?? []).forEach((q, i) => add('selector', `${p}.quotas[${i}].from`, q.from));
      }
      if (n.kind === 'limit') {
        add('selector', `${p}.from`, n.from);
        if (n.scope) add('nodepath', `${p}.scope`, n.scope);
      }
      if (n.kind === 'maturity') {
        add('selector', `${p}.applies_to`, n.applies_to);
        add('condition', `${p}.require`, n.require);
      }
      if (n.kind === 'timing') add('selector', `${p}.courses`, n.courses);
      if (n.kind === 'check') add('condition', `${p}.require`, n.require);
      if (n.kind === 'core') {
        (n.courses as unknown[]).forEach((it, i) => add('item', `${p}.courses[${i}]`, it));
      }
      if (n.kind === 'spec') {
        for (const r of n.counts_toward ?? []) {
          add('nodepath', `${p}.counts_toward`, typeof r === 'string' ? r : r.node);
          if (typeof r === 'object' && r.courses !== undefined) {
            add('selector', `${p}.counts_toward.courses`, r.courses);
          }
        }
        for (const r of n.distinct_from ?? []) add('nodepath', `${p}.distinct_from`, r.node);
      }
    }
    for (const [k, v] of Object.entries(d.sets ?? {})) add('selector', `sets.${k}`, v);
    (d.shares ?? []).forEach((s, i) => {
      for (const r of s.between ?? []) add('nodepath', `shares[${i}]`, r);
      if (s.courses) add('selector', `shares[${i}].courses`, s.courses);
      if (s.replacement?.from !== undefined) {
        add('selector', `shares[${i}].replacement.from`, s.replacement.from);
      }
    });
    (d.substitutions ?? []).forEach((s, i) => {
      add('substitution', `substitutions[${i}].with`, s.with);
      if (s.scope) add('nodepath', `substitutions[${i}].scope`, s.scope);
      if (s.when !== undefined) add('condition', `substitutions[${i}].when`, s.when);
    });
    (d.exemptions ?? []).forEach((s, i) => {
      if (s.scope) add('nodepath', `exemptions[${i}].scope`, s.scope);
      if (s.when !== undefined) add('condition', `exemptions[${i}].when`, s.when);
    });
    if (d.entry !== undefined) add('condition', 'entry', d.entry);
    if (d.allowed_if !== undefined) add('condition', 'allowed_if', d.allowed_if);
    (d.classes ?? []).forEach((c, i) => add('condition', `classes[${i}].require`, c.require));
    if (d.kind === 'course_conditions') {
      for (const [code, c] of Object.entries(d.courses ?? {})) {
        if (c.requires !== undefined) add('condition', `courses.${code}.requires`, c.requires);
        for (const x of c.excludes ?? []) {
          if (typeof x === 'string' && !RX.course.test(x) && !RX.cpattern.test(x)) {
            add('condition', `courses.${code}.excludes`, x);
          }
        }
      }
    }
    if (d.kind === 'patch') {
      for (const op of d.ops ?? []) {
        if (op.fields?.requires) add('condition', `ops.${op.target}.requires`, op.fields.requires);
      }
    }
  }
  return sites;
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
