// DP oracle (EVALUATOR.md §6): for pools with ≤ 12 candidates, the per-pool search must return the
// same set as brute-force enumeration under the SCHEMA.md §7.4 step 2 total order (and the step 4
// order for top-ups).
/* eslint-disable no-bitwise */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Choice, Dimension } from '../src/eval/dp';
import { choose } from '../src/eval/dp';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const lexCompare = (a: readonly number[], b: readonly number[]): number => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? -Infinity;
    const y = b[i] ?? -Infinity;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
};

// The spec's order, written out directly from §7.4 step 2 criteria 1–7 (and step 4).
const oracle = ({ dims, weights, mode }: Choice): number[] => {
  const n = weights.length;
  let best: { key: number[]; set: number[] } | undefined;
  for (let mask = 0; mask < 1 << n; mask++) {
    const set = [...Array(n).keys()].filter((i) => mask & (1 << i));
    const totals = dims.map((d) => sum(set.map((i) => d.contrib[i] ?? 0)));
    const admissible = dims.every(
      (d, k) => d.max === undefined || d.held + (totals[k] ?? 0) <= d.max
    );
    if (admissible) {
      const uoc = totals[0] ?? 0;
      const scarcity = sum(set.map((i) => weights[i] ?? 0));
      let key: number[];
      if (mode === 'topup') key = [-uoc, set.length, scarcity];
      else {
        let unmet = 0;
        let uocShort = 0;
        let countShort = 0;
        dims.forEach((d, k) => {
          if (d.min === undefined) return;
          const short = Math.max(0, d.min - d.held - (totals[k] ?? 0));
          if (short > 0) unmet += 1;
          if (d.kind === 'uoc') uocShort += short;
          else countShort += short;
        });
        key = [unmet, uocShort, countShort, uoc, set.length, scarcity];
      }
      const c = best ? lexCompare(key, best.key) : -1;
      if (c < 0 || (c === 0 && best && lexCompare(set, best.set) < 0)) best = { key, set };
    }
  }
  return best?.set ?? [];
};

const bound = fc.option(fc.integer({ min: 0, max: 48 }), { nil: undefined });
const choice = fc.integer({ min: 0, max: 12 }).chain((n) => {
  const uocs = fc.array(fc.constantFrom(2, 3, 4, 6, 6, 6, 12), { minLength: n, maxLength: n });
  return fc.record({
    uocs,
    held: fc.constantFrom(0, 0, 6),
    uocMin: bound,
    uocMax: bound,
    countMin: fc.option(fc.integer({ min: 0, max: 8 }), { nil: undefined }),
    countMax: fc.option(fc.integer({ min: 0, max: 8 }), { nil: undefined }),
    quotas: fc.array(
      fc.record({
        hits: fc.array(fc.boolean(), { minLength: n, maxLength: n }),
        kind: fc.constantFrom<'uoc' | 'count'>('uoc', 'count'),
        min: fc.option(fc.integer({ min: 0, max: 24 }), { nil: undefined }),
        max: fc.option(fc.integer({ min: 0, max: 24 }), { nil: undefined })
      }),
      { maxLength: 2 }
    ),
    weights: fc.array(fc.integer({ min: 0, max: 3 }), { minLength: n, maxLength: n }),
    mode: fc.constantFrom<'fill' | 'topup'>('fill', 'fill', 'topup')
  });
});

// exactOptionalPropertyTypes: leave a bound out rather than set it to undefined
const bounds = (min?: number, max?: number) => ({
  ...(min === undefined ? {} : { min }),
  ...(max === undefined ? {} : { max })
});

type Gen = typeof choice extends fc.Arbitrary<infer T> ? T : never;

const toChoice = (g: Gen): Choice => {
  const dims: Dimension[] = [
    { contrib: g.uocs, held: g.held, ...bounds(g.uocMin, g.uocMax), kind: 'uoc' },
    { contrib: g.uocs.map(() => 1), held: 0, ...bounds(g.countMin, g.countMax), kind: 'count' },
    ...g.quotas.map(
      (q): Dimension => ({
        contrib: q.hits.map((h, i) => (h ? (q.kind === 'uoc' ? (g.uocs[i] ?? 0) : 1) : 0)),
        held: 0,
        ...bounds(q.min, q.max),
        kind: q.kind
      })
    )
  ];
  return { dims, weights: g.weights, mode: g.mode };
};

describe('pool DP oracle', () => {
  it('matches brute force on the spec examples', () => {
    const pool = (uocs: number[], min: number, max?: number): Choice => ({
      dims: [
        { contrib: uocs, held: 0, ...bounds(min, max), kind: 'uoc' },
        { contrib: uocs.map(() => 1), held: 0, kind: 'count' }
      ],
      weights: uocs.map(() => 0),
      mode: 'fill'
    });
    // m5-compbh-subset-sum: exactly 24 from 6+6+2+2+6+6 takes the four 6s
    expect(choose(pool([6, 6, 2, 2, 6, 6], 24, 24))).toEqual([0, 1, 4, 5]);
    // n5-overshoot: {min: 30} from 6,6,6,4,4,6,6 takes the five 6s
    expect(choose(pool([6, 6, 6, 4, 4, 6, 6], 30))).toEqual([0, 1, 2, 5, 6]);
  });

  it('agrees with brute-force enumeration (≤ 12 candidates)', () => {
    fc.assert(
      fc.property(choice, (g) => {
        const c = toChoice(g);
        expect(choose(c)).toEqual(oracle(c));
      }),
      { numRuns: 3_000 }
    );
  });
});
