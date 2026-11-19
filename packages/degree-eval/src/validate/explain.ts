// Readable schema errors. Ajv reports every branch of every oneOf it tried, so a node with one bad
// field also "is missing" the fields of every other node kind. This module:
//  1. validates requirement nodes and patch ops against the branch their `kind` / `op` names,
//  2. collapses the remaining type unions (string | list | mapping) to the branch that got furthest,
//  3. words each error for a degree author, with the offending value and a "did you mean".
/* eslint-disable import/extensions -- ./generated/validators is a generated .js with a .d.ts beside it */
import type { SchemaError, Validator } from './generated/validators';
import { nodeValidators, opValidators } from './generated/validators';
import type { DocKind } from './kinds';
import { DOC_KINDS, KIND_VALIDATORS } from './kinds';

export type Path = (string | number)[];

export interface SchemaIssue {
  path: Path; // location in the document
  field?: boolean; // the issue is about the field name at `path` (unknown or forbidden field)
  message: string; // `${where}: ${what}`
}

const MAX_ISSUES = 30;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

// `requirements[3].courses[0]`, `courses.COMP1511`; the document itself is `document`
export const displayPath = (p: Path): string =>
  p.length === 0
    ? 'document'
    : p
        .map((x, i) => {
          if (typeof x === 'number') return `[${x}]`;
          return /^[A-Za-z_][\w-]*$/.test(x) ? `${i ? '.' : ''}${x}` : `[${JSON.stringify(x)}]`;
        })
        .join('');

const show = (v: unknown): string => {
  const s = typeof v === 'string' ? JSON.stringify(v) : (JSON.stringify(v) ?? String(v));
  return s.length > 50 ? `${s.slice(0, 47)}…` : s;
};

const typeName = (v: unknown): string => {
  if (v === null) return 'empty (null)';
  if (Array.isArray(v)) return 'a list';
  if (typeof v === 'object') return 'a mapping';
  if (typeof v === 'string') return `text ${show(v)}`;
  if (typeof v === 'boolean') return `${String(v)}`;
  return `the number ${JSON.stringify(v)}`;
};

const TYPE_WORDS: Record<string, string> = {
  string: 'text',
  number: 'a number',
  integer: 'a whole number',
  boolean: 'true or false',
  array: 'a list',
  object: 'a mapping (key: value lines)',
  null: 'empty'
};

const orList = (xs: string[]): string =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1] ?? ''}`;

// What each pattern in schema.json means, for "is not …" messages.
const PATTERNS: Record<string, string> = {
  '^1\\.[0-9]+$': 'a schema version like "1.0"',
  '^[A-Z]{4}[0-9]{4}$': 'a course code like COMP1511 (4 capital letters, then 4 digits)',
  '^[A-Z]{5}[0-9A-Z]$':
    'a specialisation code like COMPA1 (5 capital letters, then a letter or digit)',
  '^([A-Z*]{5}[0-9A-Z*]|@[a-z][a-z0-9_]*)$':
    'a specialisation code (COMPA1), a pattern with * (COMP*1) or a group like @cse_majors',
  '^[0-9]{4}$': 'a 4-digit program code like 3778',
  '^@[a-z][a-z0-9_]*$': 'a group reference like @cse_programs',
  '^[a-z0-9][a-z0-9-]*$': 'a node id: lowercase letters, digits and hyphens, like level-1-core',
  '^(root|spec:[A-Z]{5}[0-9A-Z](/[a-z0-9][a-z0-9-]*)*|[a-z0-9][a-z0-9-]*(/([a-z0-9][a-z0-9-]*|[A-Z]{5}[0-9A-Z]))*)$':
    'a node path like core, major/COMPA1/core, spec:COMPA1 or root',
  '^[a-z][a-z0-9_]*$': 'a lowercase name (letters, digits and _), like prior_program',
  '^[A-Z*]{4}[0-9*]{4}$': 'a course pattern like COMP3*** (* matches one character)',
  '^[A-Z][A-Z0-9_]*$': 'an organisation code like ENG or CSE',
  '^[A-Z]{4}[0-9]{4}(( or [A-Z]{4}[0-9]{4})*|( and [A-Z]{4}[0-9]{4})*)$':
    'a valid core item: a course code like COMP1511, or codes joined only by " or " or only by " and "',
  '^[A-Z*]{4}[0-9*]{4}(( or [A-Z*]{4}[0-9*]{4})*|( and [A-Z*]{4}[0-9*]{4})*)$':
    'a valid item: a course code or pattern, or several joined only by " or " or only by " and "',
  '^[a-z_]+$': 'lowercase letters and underscores',
  '^([A-Z]{4}[0-9]{4}|(spec|program)\\(.*\\))$':
    'a course code like COMP1511, or spec(...) / program(...)',
  '^[a-z0-9][a-z0-9_-]*$': 'lowercase letters, digits, "_" and "-"',
  '^[A-Z]{2,3}$': '2 or 3 capital letters',
  '^examples/.+\\.ya?ml$': 'a path under examples/ ending in .yaml'
};

const FORMATS: Record<string, string> = {
  date: 'a date written YYYY-MM-DD, like 2026-10-11',
  uri: 'a full web address starting with https://'
};

// Levenshtein distance, for "did you mean"
const distance = (a: string, b: string): number => {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j] ?? 0;
      row[j] = Math.min(cur + 1, (row[j - 1] ?? 0) + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length] ?? 0;
};

export const didYouMean = (word: string, options: readonly string[]): string => {
  const best = options
    .map((o) => [o, distance(word.toLowerCase(), o.toLowerCase())] as const)
    .filter(([, d]) => d <= Math.max(1, Math.floor(word.length / 3)))
    .sort((x, y) => x[1] - y[1])[0];
  return best ? ` (did you mean "${best[0]}"?)` : '';
};

const decode = (seg: string) => seg.replaceAll('~1', '/').replaceAll('~0', '~');

// JSON pointer → path, with list indices as numbers (decided by the data, not the text)
const toPath = (pointer: string, root: unknown): Path => {
  const out: Path = [];
  let cur: unknown = root;
  for (const raw of pointer === '' ? [] : pointer.slice(1).split('/')) {
    const seg = decode(raw);
    if (Array.isArray(cur)) {
      out.push(Number(seg));
      cur = cur[Number(seg)];
    } else {
      out.push(seg);
      cur = isObj(cur) ? cur[seg] : undefined;
    }
  }
  return out;
};

const valueAt = (root: unknown, p: Path): unknown =>
  p.reduce<unknown>(
    (cur, k) =>
      isObj(cur) || Array.isArray(cur) ? (cur as Record<string | number, unknown>)[k] : undefined,
    root
  );

const key = (p: Path) => JSON.stringify(p);
const isUnder = (p: Path, base: Path) =>
  p.length >= base.length && base.every((x, i) => p[i] === x);

interface Err {
  path: Path;
  e: SchemaError;
}

// A condition from an if/then, rendered for "is not allowed …" messages.
const describeIf = (cond: unknown): string => {
  if (!isObj(cond)) return '';
  const props = isObj(cond.properties) ? cond.properties : undefined;
  const negated = isObj(cond.not) ? cond.not : undefined;
  if (props) {
    const [[field, rule] = []] = Object.entries(props);
    if (field && isObj(rule) && 'const' in rule) return ` when ${field} is ${show(rule.const)}`;
  }
  if (negated && isObj(negated.properties)) {
    const [[field, rule] = []] = Object.entries(negated.properties);
    if (field && isObj(rule) && 'const' in rule) return ` unless ${field} is ${show(rule.const)}`;
  }
  return '';
};

// One readable sentence for one error.
const word = ({ path, e }: Err, root: unknown, ifAt: Map<string, unknown>): SchemaIssue[] => {
  const value = 'data' in e ? e.data : valueAt(root, path);
  const at = (p: Path, what: string): SchemaIssue => ({
    path: p,
    message: `${displayPath(p)}: ${what}`
  });
  const fieldAt = (p: Path, what: string): SchemaIssue => ({ ...at(p, what), field: true });
  const here = (what: string) => at(path, what);
  const p = e.params;
  switch (e.keyword) {
    case 'required':
      return [here(`missing required field "${String(p.missingProperty)}"`)];
    case 'additionalProperties': {
      const field = String(p.additionalProperty);
      const allowed = isObj(e.parentSchema?.properties)
        ? Object.keys(e.parentSchema.properties)
        : [];
      return [fieldAt([...path, field], `unknown field "${field}"${didYouMean(field, allowed)}`)];
    }
    case 'type': {
      const want = String(p.type)
        .split(',')
        .map((t) => TYPE_WORDS[t] ?? t);
      return [here(`must be ${orList(want)}, but is ${typeName(value)}`)];
    }
    case 'enum': {
      const allowed = (p.allowedValues as unknown[]).map(show);
      const hint =
        typeof value === 'string'
          ? didYouMean(value, (p.allowedValues as unknown[]).map(String))
          : '';
      return [here(`${show(value)} is not allowed; use one of ${allowed.join(', ')}${hint}`)];
    }
    case 'const':
      return [here(`must be ${show(p.allowedValue)}, but is ${show(value)}`)];
    case 'pattern': {
      const meaning = PATTERNS[String(p.pattern)];
      return [
        here(
          meaning
            ? `${show(value)} is not ${meaning}`
            : `${show(value)} does not match ${String(p.pattern)}`
        )
      ];
    }
    case 'format':
      return [
        here(`${show(value)} is not ${FORMATS[String(p.format)] ?? `a valid ${String(p.format)}`}`)
      ];
    case 'minimum':
    case 'exclusiveMinimum':
      return [
        here(
          `must be ${e.keyword === 'minimum' ? 'at least' : 'more than'} ${String(p.limit)}, but is ${show(value)}`
        )
      ];
    case 'maximum':
    case 'exclusiveMaximum':
      return [
        here(
          `must be ${e.keyword === 'maximum' ? 'at most' : 'less than'} ${String(p.limit)}, but is ${show(value)}`
        )
      ];
    case 'minItems':
      return [
        here(
          Number(p.limit) === 1
            ? 'must not be an empty list'
            : `needs at least ${String(p.limit)} items`
        )
      ];
    case 'maxItems':
      return [here(`can have at most ${String(p.limit)} items`)];
    case 'minLength':
      return [
        here(
          Number(p.limit) === 1
            ? 'must not be empty'
            : `must be at least ${String(p.limit)} characters`
        )
      ];
    case 'minProperties':
      return [
        here(
          Number(p.limit) === 1
            ? 'must not be an empty mapping'
            : `needs at least ${String(p.limit)} fields`
        )
      ];
    case 'maxProperties':
      return [
        here(
          Number(p.limit) === 1
            ? 'must have exactly one key (for example {and: [...]} or {uoc: 12})'
            : `can have at most ${String(p.limit)} fields`
        )
      ];
    case 'uniqueItems':
      return [here(`lists the same value twice (items ${String(p.j)} and ${String(p.i)})`)];
    case 'not': {
      const forbidden =
        isObj(e.schema) && Array.isArray(e.schema.required) ? (e.schema.required as string[]) : [];
      const cond = describeIf(ifAt.get(key(path)));
      if (forbidden.length)
        return forbidden.map((f) => fieldAt([...path, f], `field "${f}" is not allowed${cond}`));
      return [here(`this combination of fields is not allowed${cond}`)];
    }
    default:
      return [here(e.message ?? `fails the schema rule "${e.keyword}"`)];
  }
};

const SHALLOW = new Set(['type', 'const', 'enum']);

// Collapses union bookkeeping and words what is left. `base` prefixes every instancePath.
const explainErrors = (
  errors: readonly SchemaError[],
  base: Path,
  root: unknown
): SchemaIssue[] => {
  const errs: Err[] = errors.map((e) => ({
    path: [...base, ...toPath(e.instancePath, valueAt(root, base))],
    e
  }));
  const drop = new Set<Err>();
  const extra: SchemaIssue[] = [];
  const ifAt = new Map<string, unknown>();

  for (const x of errs) {
    if (x.e.keyword === 'if') {
      drop.add(x);
      ifAt.set(key(x.path), x.e.parentSchema?.if);
    }
  }
  // anyOf whose branches only ask for fields: "needs one of …"
  for (const x of errs.filter((y) => y.e.keyword === 'anyOf')) {
    const branches = errs.filter(
      (y) => y !== x && key(y.path) === key(x.path) && y.e.schemaPath.includes('/anyOf/')
    );
    drop.add(x);
    if (branches.length && branches.every((y) => y.e.keyword === 'required')) {
      branches.forEach((y) => drop.add(y));
      const fields = branches.map((y) => `"${String(y.e.params.missingProperty)}"`);
      extra.push({
        path: x.path,
        message: `${displayPath(x.path)}: needs at least one of ${orList(fields)}`
      });
    }
  }
  // oneOf: keep the branch that got past the type check; if none did, say which types fit
  for (const x of errs.filter((y) => y.e.keyword === 'oneOf')) {
    drop.add(x);
    const inside = errs.filter((y) => y !== x && !drop.has(y) && isUnder(y.path, x.path));
    const shallow = inside.filter((y) => key(y.path) === key(x.path) && SHALLOW.has(y.e.keyword));
    const progressed = inside.filter((y) => !shallow.includes(y));
    if (progressed.length) {
      shallow.forEach((y) => drop.add(y));
    } else if (shallow.length) {
      shallow.forEach((y) => drop.add(y));
      const kinds = [
        ...new Set(
          shallow.flatMap((y) => {
            if (y.e.keyword === 'type')
              return String(y.e.params.type)
                .split(',')
                .map((t) => TYPE_WORDS[t] ?? t);
            if (y.e.keyword === 'const') return [show(y.e.params.allowedValue)];
            return (y.e.params.allowedValues as unknown[]).map(show);
          })
        )
      ];
      const value = valueAt(root, x.path);
      extra.push({
        path: x.path,
        message: `${displayPath(x.path)}: must be ${orList(kinds)}, but is ${typeName(value)}`
      });
    }
  }
  const worded = errs.filter((x) => !drop.has(x)).flatMap((x) => word(x, root, ifAt));
  const seen = new Set<string>();
  return [...extra, ...worded].filter((i) => !seen.has(i.message) && seen.add(i.message));
};

const PLACEHOLDER_NODE = { id: 'placeholder', kind: 'info', text: 'placeholder' };
const NODE_KINDS = Object.keys(nodeValidators);
const OP_NAMES = Object.keys(opValidators);

interface Location {
  path: Path;
  what: 'node' | 'op';
}

// Requirement nodes (with group children) and patch ops, wherever they occur.
const locations = (d: Obj): Location[] => {
  const out: Location[] = [];
  const nodes = (list: unknown, path: Path) => {
    if (!Array.isArray(list)) return;
    list.forEach((n: unknown, i) => {
      out.push({ path: [...path, i], what: 'node' });
      if (isObj(n) && n.kind === 'group') nodes(n.children, [...path, i, 'children']);
    });
  };
  const ops = (list: unknown, path: Path) => {
    if (!Array.isArray(list)) return;
    list.forEach((op: unknown, i) => {
      out.push({ path: [...path, i], what: 'op' });
      if (isObj(op) && op.node !== undefined) {
        out.push({ path: [...path, i, 'node'], what: 'node' });
        if (isObj(op.node) && op.node.kind === 'group')
          nodes(op.node.children, [...path, i, 'node', 'children']);
      }
    });
  };
  nodes(d.requirements, ['requirements']);
  ops(d.ops, ['ops']);
  ops(d.patch, ['patch']);
  if (Array.isArray(d.components)) {
    d.components.forEach((c: unknown, i) => {
      if (isObj(c)) ops(c.patch, ['components', i, 'patch']);
    });
  }
  return out;
};

// One node or op, against the branch it names; its nested nodes are checked as their own locations.
const explainLocation = (root: Obj, { path, what }: Location): SchemaIssue[] => {
  const v = valueAt(root, path);
  const where = displayPath(path);
  const tag = what === 'node' ? 'kind' : 'op';
  const names = what === 'node' ? NODE_KINDS : OP_NAMES;
  if (!isObj(v))
    return [
      {
        path,
        message: `${where}: must be a mapping with ${what === 'node' ? 'an id and a kind' : 'an op'}, but is ${typeName(v)}`
      }
    ];
  const name = v[tag];
  if (name === undefined) {
    return [
      { path, message: `${where}: missing required field "${tag}" (one of ${names.join(', ')})` }
    ];
  }
  const table = what === 'node' ? nodeValidators : opValidators;
  const validator: Validator | undefined = typeof name === 'string' ? table[name] : undefined;
  if (!validator) {
    return [
      {
        path: [...path, tag],
        message: `${displayPath([...path, tag])}: unknown ${tag} ${show(name)}${didYouMean(typeof name === 'string' ? name : '', names)}; use one of ${names.join(', ')}`
      }
    ];
  }
  // nested nodes are their own locations; give this one a valid stand-in so it is judged alone
  const copy: Obj = { ...v };
  if (what === 'node' && Array.isArray(copy.children))
    copy.children = copy.children.length ? [PLACEHOLDER_NODE] : [];
  if (what === 'op' && isObj(copy.node)) copy.node = PLACEHOLDER_NODE;
  if (validator(copy)) return [];
  const nested = what === 'op' ? '/node' : '/children/';
  const errors = (validator.errors ?? []).filter((e) => !e.instancePath.startsWith(nested));
  return explainErrors(errors, path, root);
};

// Readable issues for a document that fails its schema ([] when it is valid).
export const explainDocument = (d: unknown): SchemaIssue[] => {
  if (!isObj(d)) {
    return [
      { path: [], message: `document: must be a mapping (key: value lines), but is ${typeName(d)}` }
    ];
  }
  const { kind } = d;
  if (kind === undefined) {
    return [
      {
        path: [],
        message: `document: missing required field "kind" (one of ${DOC_KINDS.join(', ')})`
      }
    ];
  }
  if (typeof kind !== 'string' || !(DOC_KINDS as readonly string[]).includes(kind)) {
    return [
      {
        path: ['kind'],
        message: `kind: unknown document kind ${show(kind)}${didYouMean(typeof kind === 'string' ? kind : '', DOC_KINDS)}; use one of ${DOC_KINDS.join(', ')}`
      }
    ];
  }
  const locs = locations(d);
  const validator = KIND_VALIDATORS[kind as DocKind];
  const docErrors = validator(d)
    ? []
    : (validator.errors ?? []).filter((e) => {
        const p = toPath(e.instancePath, d);
        return !locs.some((l) => isUnder(p, l.path));
      });
  const issues = [
    ...explainErrors(docErrors, [], d),
    ...locs.flatMap((l) => explainLocation(d, l))
  ];
  if (issues.length <= MAX_ISSUES) return issues;
  return [
    ...issues.slice(0, MAX_ISSUES),
    { path: [], message: `document: ${issues.length - MAX_ISSUES} more problems not shown` }
  ];
};
