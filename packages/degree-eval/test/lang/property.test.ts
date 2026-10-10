// Property tests over canonical ASTs (SPEC-M0-M1.md T13), 10⁴ runs per property.
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Condition, CoreItem, NodePath, Selector } from '../../src';
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
} from '../../src';
import { flattenOp } from '../../src/lang/ast';

const RUNS = { numRuns: 10_000 };
const MAX_DEPTH = 4;

// ---------- leaves, from the RX shapes ----------
const course = fc.stringMatching(/^[A-Z]{4}[0-9]{4}$/);
const cpattern = fc.stringMatching(/^[A-Z*]{4}[0-9*]{4}$/).filter((p) => p.includes('*'));
const label = fc.stringMatching(/^[a-z][a-z0-9_]{0,8}$/);
const org = fc.stringMatching(/^[A-Z][A-Z0-9_]{0,5}$/);
const nodeId = fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,8}$/);
const specCode = fc.stringMatching(/^[A-Z]{5}[0-9A-Z]$/);
const mark = fc.integer({ min: 0, max: 10_000 }).map((n) => n / 100); // 0–100, ≤ 2 decimals

const nodePath: fc.Arbitrary<NodePath> = fc.oneof(
  fc.constant<NodePath>({ form: 'root' }),
  fc.record({
    form: fc.constant('spec' as const),
    spec: specCode,
    ids: fc.array(nodeId, { maxLength: 3 })
  }),
  fc
    .tuple(
      nodeId,
      fc.array(
        fc.oneof(
          nodeId.map((id) => ({ id })),
          specCode.map((spec) => ({ spec }))
        ),
        {
          maxLength: 3
        }
      )
    )
    .map(([head, rest]): NodePath => ({ form: 'rel', segments: [{ id: head }, ...rest] }))
);
const nodePathText = nodePath.map(printNodePath);

// and/or with ≥ 2 children and no same-op child (flattening a canonical child keeps it canonical)
const boolNode = <T>(op: 'and' | 'or', child: fc.Arbitrary<T>): fc.Arbitrary<T> =>
  fc.array(child, { minLength: 2, maxLength: 4 }).map((xs) => ({ [op]: flattenOp(op, xs) }) as T);

const selectorArb = (withIn: boolean): fc.Arbitrary<Selector> => {
  const leaves: fc.Arbitrary<Selector>[] = [
    course,
    cpattern.map((pattern) => ({ pattern })),
    label.map((set) => ({ set })),
    fc.integer({ min: 0, max: 9 }).map((level) => ({ level })),
    org.map((faculty) => ({ faculty })),
    org.map((school) => ({ school })),
    fc
      .constantFrom('ugrd' as const, 'pgrd' as const, 'rsch' as const)
      .map((career) => ({ career })),
    label.map((attr) => ({ attr })),
    fc.constant({ gened: true as const }),
    fc.constant({ any: true as const })
  ];
  if (withIn) leaves.push(nodePathText.map((p) => ({ in: p })));
  const leaf = fc.oneof(...leaves);
  const tree = (depth: number): fc.Arbitrary<Selector> =>
    depth >= MAX_DEPTH
      ? leaf
      : fc.oneof(
          { arbitrary: leaf, weight: 3 },
          { arbitrary: boolNode('and', tree(depth + 1)), weight: 1 },
          { arbitrary: boolNode('or', tree(depth + 1)), weight: 1 },
          { arbitrary: tree(depth + 1).map((s) => ({ not: s })), weight: 1 }
        );
  return tree(1);
};
const selector = selectorArb(true);
const coresSelector = selectorArb(false);

const withIn = (min: fc.Arbitrary<number>) =>
  fc
    .tuple(min, fc.option(selector, { nil: undefined }))
    .map(([m, s]) => (s === undefined ? { min: m } : { min: m, in: s }));

const conditionArb = (manualWithId: boolean): fc.Arbitrary<Condition> => {
  const manual: fc.Arbitrary<Condition>[] = [fc.string().map((text) => ({ manual: text }))];
  if (manualWithId) {
    manual.push(
      fc.tuple(fc.string({ minLength: 1 }), nodeId).map(([text, id]) => ({ manual: { text, id } }))
    );
  }
  const leaf: fc.Arbitrary<Condition> = fc.oneof(
    course,
    fc.boolean(),
    course.map((coreq) => ({ coreq })),
    course.map((planned) => ({ planned })),
    withIn(fc.integer({ min: 0, max: 999 })).map((uoc) => ({ uoc })),
    withIn(mark).map((wam) => ({ wam })),
    fc.tuple(mark, course).map(([min, c]) => ({ grade: { min, course: c } })),
    fc
      .tuple(
        mark,
        selector.filter((s) => typeof s !== 'string')
      )
      .map(([min, s]) => ({ grade: { min, in: s } })),
    fc.oneof(fc.constant(true as const), coresSelector).map((cores) => ({ cores })),
    nodePathText.map((complete) => ({ complete })),
    fc.tuple(mark, label).map(([min, l]) => ({ reported_wam: { min, label: l } })),
    fc
      .array(
        fc.oneof(
          fc.stringMatching(/^[0-9]{4}$/),
          label.map((l) => `@${l}`)
        ),
        {
          minLength: 1,
          maxLength: 3
        }
      )
      .map((program) => ({ program })),
    fc
      .array(
        fc.oneof(
          specCode,
          fc.stringMatching(/^[A-Z*]{5}[0-9A-Z*]$/),
          label.map((l) => `@${l}`)
        ),
        { minLength: 1, maxLength: 3 }
      )
      .map((spec) => ({ spec })),
    ...manual
  );
  const tree = (depth: number): fc.Arbitrary<Condition> =>
    depth >= MAX_DEPTH
      ? leaf
      : fc.oneof(
          { arbitrary: leaf, weight: 3 },
          { arbitrary: boolNode('and', tree(depth + 1)), weight: 1 },
          { arbitrary: boolNode('or', tree(depth + 1)), weight: 1 },
          { arbitrary: tree(depth + 1).map((c) => ({ not: c })), weight: 1 }
        );
  return tree(1);
};
const condition = conditionArb(false);

const coreItem: fc.Arbitrary<CoreItem> = fc.oneof(
  course,
  fc.array(course, { minLength: 2, maxLength: 4 }).map((or) => ({ or })),
  fc.array(course, { minLength: 2, maxLength: 4 }).map((and) => ({ and }))
);

// ---------- a noisy printer: random whitespace and redundant parentheses ----------
// Prints the same AST as the canonical printer would, but re-spaced by a seeded PRNG.
const noisy = (seed: number) => {
  // Park–Miller minimal standard generator
  const M = 2_147_483_647;
  let state = (((seed % (M - 1)) + (M - 1)) % (M - 1)) + 1;
  const rand = () => {
    state = (state * 48_271) % M;
    return state / M;
  };
  const SPACES = ['', ' ', '  ', '\n', '\t '];
  const sp = () => SPACES[Math.floor(rand() * SPACES.length)] as string;
  const ws = () => (rand() < 0.5 ? ' ' : ` ${sp()}`);
  const paren = (s: string) => (rand() < 0.25 ? `(${sp()}${s}${sp()})` : s);
  const call = (fn: string, args: string[]) =>
    `${fn}${sp()}(${sp()}${args.join(`${sp()},${sp()}`)}${sp()})`;
  // an and/or operand of not keeps its parentheses; anything else may gain redundant ones
  const group = <T>(x: T, f: (x: T) => string) =>
    typeof x === 'object' && x !== null && ('and' in x || 'or' in x)
      ? `(${sp()}${f(x)}${sp()})`
      : f(x);
  const ops = <T>(op: string, xs: T[], f: (x: T) => string) =>
    xs.map((x) => `(${sp()}${f(x)}${sp()})`).join(`${ws()}${op}${ws()}`);

  const sel = (s: Selector): string => {
    if (typeof s === 'string') return paren(s);
    if ('and' in s) return paren(ops('and', s.and, sel));
    if ('or' in s) return paren(ops('or', s.or, sel));
    if ('not' in s) return paren(`not${ws()}${group(s.not, sel)}`);
    return paren(printSelector(s));
  };
  const cond = (c: Condition): string => {
    if (typeof c === 'string' || typeof c === 'boolean') return paren(String(c));
    if ('and' in c) return paren(ops('and', c.and, cond));
    if ('or' in c) return paren(ops('or', c.or, cond));
    if ('not' in c) return paren(`not${ws()}${group(c.not, cond)}`);
    if ('uoc' in c || 'wam' in c) {
      const [fn, v] = 'uoc' in c ? ['uoc', c.uoc] : ['wam', c.wam];
      return paren(call(fn, v.in === undefined ? [String(v.min)] : [String(v.min), sel(v.in)]));
    }
    if ('grade' in c) {
      const g = c.grade;
      return paren(call('grade', [String(g.min), 'course' in g ? paren(g.course) : sel(g.in)]));
    }
    if ('cores' in c) return paren(call('cores', c.cores === true ? [] : [sel(c.cores)]));
    if ('program' in c) return paren(call('program', c.program));
    if ('spec' in c) return paren(call('spec', c.spec));
    return paren(printCondition(c));
  };
  return { sel, cond };
};

// ---------- (d) helpers ----------
const sameOpOk = (v: unknown): boolean => {
  if (Array.isArray(v)) return v.every(sameOpOk);
  if (!v || typeof v !== 'object') return true;
  return Object.entries(v).every(([k, child]) => {
    if (k === 'and' || k === 'or') {
      const xs = child as unknown[];
      const nested = xs.some(
        (x) => x && typeof x === 'object' && !Array.isArray(x) && Object.keys(x)[0] === k
      );
      return xs.length >= 2 && !nested && xs.every(sameOpOk);
    }
    return sameOpOk(child);
  });
};

// Arbitrary structured nestings: same-op and/or, singletons, compact strings, selector lists.
const messyCondition: fc.Arbitrary<unknown> = fc.letrec<{ c: unknown }>((tie) => ({
  c: fc.oneof(
    { depthSize: 'small', withCrossShrink: true },
    condition,
    condition.filter((c) => typeof c !== 'object' || !('manual' in c)).map(printCondition),
    fc.array(tie('c'), { minLength: 1, maxLength: 3 }).map((and) => ({ and })),
    fc.array(tie('c'), { minLength: 1, maxLength: 3 }).map((or) => ({ or })),
    tie('c').map((not) => ({ not }))
  )
})).c;

const messySelector: fc.Arbitrary<unknown> = fc.letrec<{ s: unknown }>((tie) => ({
  s: fc.oneof(
    { depthSize: 'small', withCrossShrink: true },
    selector,
    selector.map(printSelector),
    fc.array(tie('s'), { minLength: 1, maxLength: 3 }),
    fc.array(tie('s'), { minLength: 1, maxLength: 3 }).map((and) => ({ and })),
    fc.array(tie('s'), { minLength: 1, maxLength: 3 }).map((or) => ({ or })),
    tie('s').map((not) => ({ not }))
  )
})).s;

describe('property tests', () => {
  it('(a) parse(print(ast)) equals ast', () => {
    fc.assert(
      fc.property(condition, (c) => astEqual(parseCondition(printCondition(c)), c)),
      RUNS
    );
    fc.assert(
      fc.property(selector, (s) => astEqual(parseSelector(printSelector(s)), s)),
      RUNS
    );
    fc.assert(
      fc.property(coreItem, (i) => astEqual(parseCoreItem(printCoreItem(i)), i)),
      RUNS
    );
    fc.assert(
      fc.property(nodePath, (p) => astEqual(parseNodePath(printNodePath(p)), p)),
      RUNS
    );
  });

  it('(b) printing is idempotent over re-spaced, re-parenthesised input', () => {
    fc.assert(
      fc.property(condition, fc.integer(), (c, seed) => {
        const s = noisy(seed).cond(c);
        const once = printCondition(parseCondition(s));
        expect(astEqual(parseCondition(s), c)).toBe(true);
        expect(printCondition(parseCondition(once))).toBe(once);
      }),
      RUNS
    );
    fc.assert(
      fc.property(selector, fc.integer(), (sel, seed) => {
        const s = noisy(seed).sel(sel);
        const once = printSelector(parseSelector(s));
        expect(astEqual(parseSelector(s), sel)).toBe(true);
        expect(printSelector(parseSelector(once))).toBe(once);
      }),
      RUNS
    );
  });

  it('(c) normalize is the identity on canonical input', () => {
    fc.assert(
      fc.property(conditionArb(true), (c) => astEqual(normalizeCondition(c).ast, c)),
      RUNS
    );
    fc.assert(
      fc.property(selector, (s) => astEqual(normalizeSelector(s).ast, s)),
      RUNS
    );
  });

  it('(d) normalize leaves no same-op child and no singleton and/or', () => {
    fc.assert(
      fc.property(messyCondition, (v) => sameOpOk(normalizeCondition(v).ast)),
      RUNS
    );
    fc.assert(
      fc.property(messySelector, (v) => sameOpOk(normalizeSelector(v).ast)),
      RUNS
    );
  });
});
