// Corpus suite (EVALUATOR.md §6): load, resolve and evaluate every program under examples/ with an
// empty plan and with a plan that takes every core item, and check that evaluation is pure and
// does not depend on the order of the documents or of the plan.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Evaluation, PlanInstance, StudentState } from '../src';
import { createBundle, evaluate, loadDocuments, staticCatalogue } from '../src';
import { buildTree } from '../src/ir/tree';
import { listYaml, TEST_DATA } from './helpers/test-data';

const files = listYaml('examples').map((path) => ({
  path,
  text: readFileSync(join(TEST_DATA, path), 'utf8'),
  origin: 'repo' as const
}));
const catalogue = staticCatalogue({}, { uoc: 6, faculty: 'ENG', career: 'UG' });
const loaded = loadDocuments(files);
const bundle = createBundle(loaded.docs, catalogue);

const programs = files
  .filter((f) => /\/programs\//.test(f.path))
  .map((f) => {
    const [, year, code] = /examples\/(\d{4})\/programs\/(\w+)\.yaml$/.exec(f.path) ?? [];
    return { code: code ?? '', year: Number(year) };
  });

const json = (ev: Evaluation) =>
  JSON.stringify({ ...ev, nodes: [...ev.nodes], instances: [...ev.instances] });

// the first alternative of every active core item, three courses a term
const corePlan = (code: string, year: number): PlanInstance[] => {
  const tree = buildTree(bundle, { program: code, year, selections: {} });
  if ('error' in tree) throw new Error(tree.error);
  const codes = [
    ...new Set(
      tree.active.flatMap((n) => (n.items ?? []).flatMap((i) => i.alternatives[0]?.codes ?? []))
    )
  ].filter((c) => /^[A-Z]{4}\d{4}$/.test(c));
  return codes.map((c, i) => ({
    iid: `${c.toLowerCase()}-${i}`,
    code: c,
    term: Math.floor(i / 3) + 1,
    status: 'planned'
  }));
};

// a fixed-seed shuffle, so failures reproduce
const shuffled = <T>(xs: readonly T[], seed: number): T[] => {
  const out = [...xs];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1_103_515_245 + 12_345) % 2_147_483_648;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
};

describe('corpus', () => {
  it('loads every example with no errors', () => {
    expect(loaded.diagnostics.filter((d) => d.level === 'error')).toEqual([]);
    expect(programs.length).toBeGreaterThanOrEqual(29);
  });

  describe.each(programs)('$code ($year)', ({ code, year }) => {
    it('evaluates an empty plan', () => {
      const ev = evaluate(bundle, { program: code, year, plan: [] });
      expect(ev.diagnostics.filter((d) => d.code === 'PROGRAM_NOT_FOUND')).toEqual([]);
      expect(ev.root.status).not.toBe('met');
      expect(ev.notCounted).toEqual([]);
    });

    it('evaluates every core item planned, purely and order-independently', () => {
      const plan = corePlan(code, year);
      const student: StudentState = { program: code, year, plan };
      const ev = evaluate(bundle, student);
      // every planned core course lands somewhere, or is reported as not counted
      for (const p of plan) {
        const a = ev.instances.get(p.iid);
        const placed = a && (a.primary !== null || a.shares.length > 0);
        expect(placed || ev.notCounted.includes(p.iid), p.code).toBe(true);
      }
      const once = json(ev);
      expect(json(evaluate(bundle, student))).toBe(once);
      expect(json(evaluate(bundle, { ...student, plan: shuffled(plan, 7) }))).toBe(once);
      const reordered = createBundle(loadDocuments(shuffled(files, 11)).docs, catalogue);
      expect(json(evaluate(reordered, student))).toBe(once);
    });
  });
});
