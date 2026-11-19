// Exact per-pool subset choice (SCHEMA.md §7.4 steps 2, 4, 5 and 6; EVALUATOR.md §5.3).
//
// Candidates are in canonical order. Each dimension adds a per-candidate amount (UOC, 1 for a
// count, 0 when a quota does not apply). The table is filled over candidates in reverse, so the
// entry for (index, state) holds the best value of the criteria achievable with candidates at or
// after that index; reconstruction then walks forwards and includes a candidate whenever an optimal
// completion still exists with it, which yields the lexicographically smallest index list
// (criterion 7).

export interface Dimension {
  contrib: number[]; // per candidate
  held: number; // what the pool already holds on this dimension
  min?: number;
  max?: number;
  kind: 'uoc' | 'count';
}

export interface Choice {
  // dims[0] must be the pool's UOC: never capped (criterion 4 tells 32 from 34)
  dims: Dimension[];
  weights: number[]; // criterion 6 scarcity, per candidate
  mode: 'fill' | 'topup'; // step 2/5 order, or step 4 (maximise UOC, then criteria 5–7)
}

export class BudgetExceeded extends Error {}

export const CELL_BUDGET = 5_000_000;

const lexLess = (a: readonly number[], b: readonly number[]): boolean => {
  for (let i = 0; i < a.length; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
};

const same = (a: readonly number[], b: readonly number[]) => !lexLess(a, b) && !lexLess(b, a);

export const choose = ({ dims, weights, mode }: Choice): number[] => {
  const n = weights.length;
  // Progress beyond a minimum with no maximum changes no criterion, so it saturates there; a
  // dimension with neither bound is dropped (except dims[0]).
  const live = dims
    .map((d, i) => ({ d, i }))
    .filter(
      ({ d, i }) => i === 0 || d.max !== undefined || (mode === 'fill' && d.min !== undefined)
    );
  const cap = live.map(({ d, i }) => {
    if (i === 0 || d.max !== undefined) return Infinity;
    return Math.max(0, (d.min ?? 0) - d.held);
  });

  const finalScore = (state: number[]): number[] => {
    if (mode === 'topup') return [-(state[0] ?? 0)];
    let unmet = 0;
    let uocShort = 0;
    let countShort = 0;
    live.forEach(({ d }, k) => {
      if (d.min === undefined || d.min <= 0) return;
      const short = Math.max(0, d.min - d.held - (state[k] ?? 0));
      if (short > 0) unmet += 1;
      if (d.kind === 'uoc') uocShort += short;
      else countShort += short;
    });
    return [unmet, uocShort, countShort, state[0] ?? 0];
  };
  const width = mode === 'topup' ? 1 : 4;
  const add = (v: number[], i: number) => {
    const out = [...v];
    out[width] = (out[width] ?? 0) + 1; // criterion 5: fewest instances
    out[width + 1] = (out[width + 1] ?? 0) + (weights[i] ?? 0); // criterion 6: scarcity
    return out;
  };

  const step = (state: number[], i: number): number[] | undefined => {
    const next = live.map(({ d }, k) =>
      Math.min(cap[k] ?? Infinity, (state[k] ?? 0) + (d.contrib[i] ?? 0))
    );
    const ok = live.every(({ d }, k) => d.max === undefined || d.held + (next[k] ?? 0) <= d.max);
    return ok ? next : undefined;
  };

  const memo = Array.from({ length: n + 1 }, () => new Map<string, number[]>());
  let cells = 0;
  const best = (i: number, state: number[]): number[] => {
    if (i === n) return [...finalScore(state), 0, 0];
    const key = state.join(',');
    const hit = memo[i]?.get(key);
    if (hit) return hit;
    cells += 1;
    if (cells > CELL_BUDGET) throw new BudgetExceeded('pool search exceeded the cell budget');
    let value = best(i + 1, state);
    const next = step(state, i);
    if (next) {
      const withIt = add(best(i + 1, next), i);
      if (lexLess(withIt, value)) value = withIt;
    }
    memo[i]?.set(key, value);
    return value;
  };

  let state = live.map(() => 0);
  const target = best(0, state);
  const chosen: number[] = [];
  let remaining = target;
  for (let i = 0; i < n; i++) {
    const next = step(state, i);
    if (next) {
      const withIt = add(best(i + 1, next), i);
      if (same(withIt, remaining)) {
        chosen.push(i);
        state = next;
        remaining = best(i + 1, next);
      } else remaining = best(i + 1, state);
    } else remaining = best(i + 1, state);
  }
  return chosen;
};
