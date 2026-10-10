// The places in a document that hold compact strings, structured conditions/selectors, core
// items or node paths: exactly the call sites of tools/validate.mjs checkDocs (:360–439).
// Tolerates malformed documents (schema errors are reported separately), so it never throws.

export type SiteKind =
  | 'condition'
  | 'selector'
  | 'item' // core.courses[]
  | 'substitution' // substitutions[].with (patterns allowed)
  | 'exclude' // a courses.*.excludes string that is neither a code nor a pattern
  | 'nodepath';

export interface Site {
  where: string; // validate.mjs location text, e.g. requirements[2].children[0].from
  kind: SiteKind;
  value: unknown;
}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const objs = (v: unknown): [Obj, number][] =>
  arr(v).flatMap((x, i): [Obj, number][] => (isObj(x) ? [[x, i]] : []));

const COURSE = /^[A-Z]{4}[0-9]{4}$/;
const CPATTERN = /^[A-Z*]{4}[0-9*]{4}$/;

// Requirement nodes in pre-order with their location, descending into groups.
export const requirementNodes = (list: unknown, path = 'requirements'): [Obj, string][] =>
  objs(list).flatMap(([n, i]): [Obj, string][] => {
    const p = `${path}[${i}]`;
    return [[n, p], ...(n.kind === 'group' ? requirementNodes(n.children, `${p}.children`) : [])];
  });

// `requirements` defaults to the document's own; validate.mjs passes the `extends` ancestor's.
export const documentSites = (d: Obj, requirements: unknown = d.requirements): Site[] => {
  const sites: Site[] = [];
  const add = (kind: SiteKind, where: string, value: unknown) => sites.push({ kind, where, value });

  for (const [n, p] of requirementNodes(requirements)) {
    switch (n.kind) {
      case 'pool':
        add('selector', `${p}.from`, n.from);
        objs(n.quotas).forEach(([q, i]) => add('selector', `${p}.quotas[${i}].from`, q.from));
        break;
      case 'limit':
        add('selector', `${p}.from`, n.from);
        if (n.scope) add('nodepath', `${p}.scope`, n.scope);
        break;
      case 'maturity':
        add('selector', `${p}.applies_to`, n.applies_to);
        add('condition', `${p}.require`, n.require);
        break;
      case 'timing':
        add('selector', `${p}.courses`, n.courses);
        break;
      case 'check':
        add('condition', `${p}.require`, n.require);
        break;
      case 'core':
        for (const it of arr(n.courses)) add('item', p, it);
        break;
      case 'spec':
        for (const r of arr(n.counts_toward)) {
          add('nodepath', `${p}.counts_toward`, isObj(r) ? r.node : r);
          if (isObj(r) && r.courses !== undefined) {
            add('selector', `${p}.counts_toward.courses`, r.courses);
          }
        }
        for (const [r] of objs(n.distinct_from)) add('nodepath', `${p}.distinct_from`, r.node);
        break;
      default:
    }
  }
  if (isObj(d.sets)) for (const [k, v] of Object.entries(d.sets)) add('selector', `sets.${k}`, v);
  for (const [s, i] of objs(d.shares)) {
    for (const r of arr(s.between)) add('nodepath', `shares[${i}]`, r);
    if (s.courses) add('selector', `shares[${i}].courses`, s.courses);
    if (isObj(s.replacement) && s.replacement.from !== undefined) {
      add('selector', `shares[${i}].replacement.from`, s.replacement.from);
    }
  }
  for (const [s, i] of objs(d.substitutions)) {
    add('substitution', `substitutions[${i}]`, s.with);
    if (s.scope) add('nodepath', `substitutions[${i}].scope`, s.scope);
    if (s.when !== undefined) add('condition', `substitutions[${i}].when`, s.when);
  }
  for (const [s, i] of objs(d.exemptions)) {
    if (s.scope) add('nodepath', `exemptions[${i}].scope`, s.scope);
    if (s.when !== undefined) add('condition', `exemptions[${i}].when`, s.when);
  }
  if (d.entry !== undefined) add('condition', 'entry', d.entry);
  if (d.allowed_if !== undefined) add('condition', 'allowed_if', d.allowed_if);
  for (const [c, i] of objs(d.classes)) add('condition', `classes[${i}].require`, c.require);
  if (d.kind === 'course_conditions' && isObj(d.courses)) {
    for (const [code, c] of Object.entries(d.courses).filter(([, v]) => isObj(v)) as [
      string,
      Obj
    ][]) {
      if (c.requires !== undefined) add('condition', `courses.${code}.requires`, c.requires);
      for (const x of arr(c.excludes)) {
        if (typeof x === 'string' && !COURSE.test(x) && !CPATTERN.test(x)) {
          add('exclude', `courses.${code}.excludes`, x);
        }
      }
    }
  }
  if (d.kind === 'patch') {
    for (const [op] of objs(d.ops)) {
      if (isObj(op.fields) && op.fields.requires) {
        add('condition', `ops.${String(op.target)}.requires`, op.fields.requires);
      }
    }
  }
  return sites;
};
