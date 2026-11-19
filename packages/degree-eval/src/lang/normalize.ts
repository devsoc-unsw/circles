import type { BoolOp, Condition, Parsed, ParseOptions, Ref, RefKind, Selector } from './ast';
import { flattenOp } from './ast';
import { analyzeCondition } from './condition';
import type { ParseWarning } from './errors';
import { formatAt, ParseError } from './errors';
import { MAX_MARK, RX, SEG_ID_RX, SELECTOR_VALUE } from './patterns';
import { printCondition, printSelector } from './print';
import { analyzeSelector } from './selector';

// Structured or mixed YAML values (SCHEMA.md §5.4, §6.1) → canonical AST. Compact strings found
// anywhere inside are parsed, never printed raw (P2), and the structured shorthands are rewritten
// to their canonical form (P3): {done: X} → X, {course: X} → X, {uoc: N} → {uoc: {min: N}},
// program numbers → strings, selector lists → or, {grade: {in: <course>}} → {grade: {course}},
// {manual: {text}} → text, singleton and/or → the element, same-op nesting flattened.

type At = (string | number)[];
const ZERO = { start: 0, end: 0 };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const describe = (v: unknown): string => {
  if (v === null) return 'null';
  return Array.isArray(v) ? 'a list' : typeof v;
};

function bad(at: At, what: string): never {
  throw new ParseError('BAD_STRUCTURE', `${formatAt(at)}: ${what}`, ZERO, '', at);
}

const boolOf = <T>(op: BoolOp, items: T[]): T => {
  const flat = flattenOp(op, items);
  return flat.length === 1 ? (flat[0] as T) : ({ [op]: flat } as T);
};

// the single key and value of a one-key map
const entry = (v: Record<string, unknown>, at: At, what: string): [string, unknown] => {
  const keys = Object.keys(v);
  if (keys.length !== 1) bad(at, `a structured ${what} needs exactly one key, got ${keys.length}`);
  const k = keys[0] as string;
  return [k, v[k]];
};

// an object with exactly the given required keys and any of the optional ones
const fields = (
  v: unknown,
  at: At,
  required: string[],
  optional: string[] = []
): Record<string, unknown> => {
  if (!isObject(v)) return bad(at, `expected an object, got ${describe(v)}`);
  for (const k of Object.keys(v)) {
    if (!required.includes(k) && !optional.includes(k)) bad(at, `unknown key "${k}"`);
  }
  for (const k of required) if (v[k] === undefined) bad(at, `missing key "${k}"`);
  return v;
};

const str = (v: unknown, at: At, rx: RegExp, what: string): string => {
  if (typeof v !== 'string' || !rx.test(v))
    return bad(at, `expected ${what}, got ${JSON.stringify(v)}`);
  return v;
};

const num = (v: unknown, at: At, opts: { int?: boolean; mark?: string }): number => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || (opts.int && !Number.isInteger(v))) {
    return bad(
      at,
      `expected a non-negative ${opts.int ? 'integer' : 'number'}, got ${JSON.stringify(v)}`
    );
  }
  if (opts.mark && v > MAX_MARK) {
    throw new ParseError(
      'MARK_OUT_OF_RANGE',
      `${opts.mark}() mark ${v} is above 100`,
      ZERO,
      '',
      at
    );
  }
  return v;
};

const list = (v: unknown, at: At, what: string): unknown[] => {
  if (!Array.isArray(v) || v.length === 0) return bad(at, `${what} needs a non-empty list`);
  return v;
};

class Normalizer {
  readonly refs: Ref[] = [];

  readonly warnings: ParseWarning[] = [];

  constructor(private readonly opts: ParseOptions) {}

  ref(kind: RefKind, name: string, at: At): void {
    this.refs.push({ kind, name, span: ZERO, at });
  }

  // a compact string at `at`; its refs and errors are tagged with `at` when it is nested
  compact<T>(src: string, at: At, analyze: (s: string) => Parsed<T>): T {
    let parsed: Parsed<T>;
    try {
      parsed = analyze(src);
    } catch (e) {
      if (e instanceof ParseError && at.length) {
        throw new ParseError(e.code, e.message, e.span, e.source, at);
      }
      throw e;
    }
    for (const r of parsed.refs) this.refs.push(at.length ? { ...r, at } : r);
    this.warnings.push(...parsed.warnings);
    return parsed.ast;
  }

  sel(v: unknown, at: At): Selector {
    if (typeof v === 'string') return this.compact(v, at, analyzeSelector);
    if (Array.isArray(v)) {
      // a YAML list is a union
      const items = list(v, at, 'a selector list').map((x, i) => this.sel(x, [...at, i]));
      return boolOf('or', items);
    }
    if (!isObject(v)) return bad(at, `expected a selector, got ${describe(v)}`);
    const [k, val] = entry(v, at, 'selector');
    const here = [...at, k];
    switch (k) {
      case 'and':
      case 'or':
        return boolOf(
          k,
          list(val, here, k).map((x, i) => this.sel(x, [...here, i]))
        );
      case 'not':
        return { not: this.sel(val, here) };
      case 'course':
        return str(val, here, RX.course, 'a course code');
      case 'pattern': {
        const p = str(val, here, RX.cpattern, 'a course pattern');
        return RX.course.test(p) ? p : { pattern: p }; // a pattern without * is a course
      }
      case 'set': {
        const name = str(val, here, RX.label, 'a set name');
        this.ref('set', name, here);
        return { set: name };
      }
      case 'level':
        if (!Number.isInteger(val) || (val as number) < 0 || (val as number) > 9) {
          bad(here, `expected a level 0-9, got ${JSON.stringify(val)}`);
        }
        return { level: val as number };
      case 'faculty':
      case 'school': {
        const org = str(val, here, SELECTOR_VALUE[k], 'an org code');
        this.ref(k, org, here);
        return k === 'faculty' ? { faculty: org } : { school: org };
      }
      case 'career':
        return {
          career: str(val, here, SELECTOR_VALUE.career, 'ugrd, pgrd or rsch') as
            | 'ugrd'
            | 'pgrd'
            | 'rsch'
        };
      case 'attr':
        return { attr: str(val, here, SELECTOR_VALUE.attr, 'an attribute name') };
      case 'in': {
        const p = str(val, here, RX.nodepath, 'a node path');
        this.ref('in', p, here);
        return { in: p };
      }
      case 'gened':
      case 'any':
        if (val !== true) bad(here, `expected true, got ${JSON.stringify(val)}`);
        return k === 'gened' ? { gened: true } : { any: true };
      default:
        return bad(at, `unknown selector key "${k}"`);
    }
  }

  // {min, in?} of uoc and wam, or the bare number shorthand
  withIn(val: unknown, at: At, fn: 'uoc' | 'wam'): { min: number; in?: Selector } {
    const numOpts = fn === 'uoc' ? { int: true } : { mark: fn };
    if (typeof val === 'number') return { min: num(val, at, numOpts) };
    const o = fields(val, at, ['min'], ['in']);
    const out: { min: number; in?: Selector } = { min: num(o.min, [...at, 'min'], numOpts) };
    if (o.in !== undefined) out.in = this.sel(o.in, [...at, 'in']);
    return out;
  }

  cond(v: unknown, at: At): Condition {
    if (typeof v === 'string') {
      return this.compact(v, at, (s) => analyzeCondition(s, this.opts));
    }
    if (typeof v === 'boolean') return v;
    if (!isObject(v)) return bad(at, `expected a condition, got ${describe(v)}`);
    const [k, val] = entry(v, at, 'condition');
    const here = [...at, k];
    switch (k) {
      case 'and':
      case 'or':
        return boolOf(
          k,
          list(val, here, k).map((x, i) => this.cond(x, [...here, i]))
        );
      case 'not':
        return { not: this.cond(val, here) };
      case 'done':
        return str(val, here, RX.course, 'a course code');
      case 'coreq':
        return { coreq: str(val, here, RX.course, 'a course code') };
      case 'planned':
        return { planned: str(val, here, RX.course, 'a course code') };
      case 'uoc':
        return { uoc: this.withIn(val, here, 'uoc') };
      case 'wam':
        return { wam: this.withIn(val, here, 'wam') };
      case 'grade': {
        const o =
          isObject(val) && 'course' in val
            ? fields(val, here, ['min', 'course'])
            : fields(val, here, ['min', 'in']);
        const min = num(o.min, [...here, 'min'], { mark: 'grade' });
        const s =
          'course' in o
            ? str(o.course, [...here, 'course'], RX.course, 'a course code')
            : this.sel(o.in, [...here, 'in']);
        return { grade: typeof s === 'string' ? { min, course: s } : { min, in: s } };
      }
      case 'reported_wam': {
        const o = fields(val, here, ['min', 'label']);
        return {
          reported_wam: {
            min: num(o.min, [...here, 'min'], { mark: 'reported_wam' }),
            label: str(o.label, [...here, 'label'], RX.label, 'a lowercase label')
          }
        };
      }
      case 'cores': {
        if (val === true) return { cores: true };
        const before = this.refs.length;
        const s = this.sel(val, here);
        if (this.refs.slice(before).some((r) => r.kind === 'in')) {
          throw new ParseError(
            'IN_INSIDE_CORES',
            'in: is not allowed inside cores(); use complete(node)',
            ZERO,
            '',
            here
          );
        }
        return { cores: s };
      }
      case 'complete': {
        const p = str(val, here, RX.nodepath, 'a node path');
        this.ref('node', p, here);
        return { complete: p };
      }
      case 'program':
      case 'spec': {
        const ok =
          k === 'program'
            ? (x: string) => RX.program.test(x) || RX.ref.test(x)
            : (x: string) => RX.spec.test(x) || RX.spattern.test(x) || RX.ref.test(x);
        const xs = list(val, here, k).map((x, i) => {
          const s = typeof x === 'number' && k === 'program' ? String(x) : x;
          if (typeof s !== 'string' || !ok(s))
            bad([...here, i], `bad ${k}() argument ${JSON.stringify(x)}`);
          if (RX.ref.test(s))
            this.ref(k === 'program' ? 'program_group' : 'spec_group', s.slice(1), [...here, i]);
          return s;
        });
        return k === 'program' ? { program: xs } : { spec: xs };
      }
      case 'manual': {
        // minLength is a schema rule (M2); the compact form accepts manual("") too
        if (typeof val === 'string') return { manual: val };
        const o = fields(val, here, ['text'], ['id']);
        const text = str(o.text, [...here, 'text'], /^/, 'a string');
        if (o.id === undefined) return { manual: text };
        return { manual: { text, id: str(o.id, [...here, 'id'], SEG_ID_RX, 'a node id') } };
      }
      default:
        return bad(at, `unknown condition key "${k}"`);
    }
  }
}

export const normalizeCondition = (v: unknown, opts: ParseOptions = {}): Parsed<Condition> => {
  const n = new Normalizer(opts);
  const ast = n.cond(v, []);
  return { ast, refs: n.refs, warnings: n.warnings };
};

export const normalizeSelector = (v: unknown): Parsed<Selector> => {
  const n = new Normalizer({});
  const ast = n.sel(v, []);
  return { ast, refs: n.refs, warnings: n.warnings };
};

export type ConditionInput = unknown;
export type SelectorInput = unknown;

export const conditionToCompact = (v: ConditionInput): string =>
  printCondition(normalizeCondition(v).ast);

export const selectorToCompact = (v: SelectorInput): string =>
  printSelector(normalizeSelector(v).ast);
