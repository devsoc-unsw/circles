// Allocation invariants over generated plans (an audit, not a fixture): for every example program,
// random plans that take the core plus random courses, checked for allocations that leave a
// requirement short while a course that would fill it sits unused or spare elsewhere.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Evaluation, PlanInstance, StudentState } from '../src';
import { createBundle, evaluate, loadDocuments, staticCatalogue } from '../src';
import { Selectors } from '../src/eval/context';
import { buildTree } from '../src/ir/tree';
import { listYaml, TEST_DATA } from './helpers/test-data';

const files = listYaml('examples').map((path) => ({
  path,
  text: readFileSync(join(TEST_DATA, path), 'utf8'),
  origin: 'repo' as const
}));

// every course code the documents mention, plus a spread of level 1–4 codes in common subjects
const SUBJECTS: Record<string, { faculty: string; school?: string }> = {
  COMP: { faculty: 'ENG', school: 'CSE' },
  SENG: { faculty: 'ENG', school: 'CSE' },
  ENGG: { faculty: 'ENG' },
  ELEC: { faculty: 'ENG' },
  MATH: { faculty: 'SCI', school: 'MATHS' },
  PHYS: { faculty: 'SCI' },
  CHEM: { faculty: 'SCI', school: 'CHEM' },
  BIOS: { faculty: 'SCI' },
  PSYC: { faculty: 'SCI' },
  DATA: { faculty: 'SCI' },
  ACCT: { faculty: 'BUS' },
  FINS: { faculty: 'BUS' },
  ECON: { faculty: 'BUS' },
  COMM: { faculty: 'BUS' },
  INFS: { faculty: 'BUS' },
  MARK: { faculty: 'BUS' },
  ARTS: { faculty: 'ADA' },
  HIST: { faculty: 'ADA' },
  ANAT: { faculty: 'MED' },
  GENL: { faculty: 'LAW' }
};
const mentioned = [
  ...new Set(files.flatMap((f) => f.text.match(/\b[A-Z]{4}[0-9]{4}\b/g) ?? []))
].filter((c) => !c.endsWith('0000'));
const spread = Object.keys(SUBJECTS).flatMap((s) =>
  [1, 2, 3, 4].flatMap((l) => [11, 27, 43].map((n) => `${s}${l}${String(n).padStart(3, '0')}`))
);
const codes = [...new Set([...mentioned, ...spread])].sort();
const factsOf = (code: string) => {
  const org = SUBJECTS[code.slice(0, 4)];
  return {
    uoc: /^ENGG[2-4]600$/.test(code) ? 2 : 6, // VIP
    career: 'ugrd',
    ...(org ? { faculty: org.faculty, ...(org.school ? { school: org.school } : {}) } : {}),
    gened: code.startsWith('GEN')
  };
};
const catalogue = staticCatalogue(Object.fromEntries(codes.map((c) => [c, factsOf(c)])), {
  uoc: 6
});
const bundle = createBundle(loadDocuments(files).docs, catalogue);
const selectors = new Selectors(bundle);

const programs = files.flatMap((f) => {
  const m = /examples\/(\d{4})\/programs\/(\w+)\.yaml$/.exec(f.path);
  return m ? [{ year: Number(m[1]), code: m[2] as string }] : [];
});

/* eslint-disable no-bitwise */
// mulberry32: 32-bit integer arithmetic, so the sequence does not degenerate into a short cycle
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};
/* eslint-enable no-bitwise */

// standard terms only (T1–T3 of each year; ordinal 4y+1 is summer)
const STANDARD = Array.from({ length: 30 }, (_, k) => 4 * Math.floor(k / 3) + 2 + (k % 3));

const planFor = (code: string, year: number, seed: number): StudentState => {
  const r = rng(seed);
  const tree = buildTree(bundle, { program: code, year, selections: {} });
  if ('error' in tree) throw new Error(tree.error);
  // a random option in each top-level slot with explicit codes
  const selections: Record<string, string[]> = {};
  for (const n of tree.nodes.values()) {
    if (n.kind === 'spec' && n.doc.kind !== 'specialisation' && Array.isArray(n.raw.options)) {
      const opts = (n.raw.options as unknown[])
        .map(String)
        .filter((o) => /^[A-Z]{5}[0-9A-Z]$/.test(o));
      const optional = (n.count?.min ?? 1) === 0;
      if (opts.length && (!optional || r() < 0.4))
        selections[n.path] = [opts[Math.floor(r() * opts.length)] as string];
    }
  }
  const withSpecs = buildTree(bundle, { program: code, year, selections });
  const core =
    'error' in withSpecs
      ? []
      : withSpecs.active.flatMap((n) =>
          (n.items ?? []).flatMap((i) => {
            const alt = i.alternatives[Math.floor(r() * i.alternatives.length)];
            return alt && r() < 0.9 ? alt.codes : [];
          })
        );
  const target = 20 + Math.floor(r() * 16); // 20–35 courses: 120–210 UOC, around a full plan
  const picked = [...new Set(core.filter((c) => /^[A-Z]{4}\d{4}$/.test(c)))];
  while (picked.length < target) {
    const c = codes[Math.floor(r() * codes.length)] as string;
    if (!picked.includes(c)) picked.push(c);
  }
  // the first third completed (a few failed), the rest planned; sometimes VIP over three terms
  const plan: PlanInstance[] = picked.map((c, k): PlanInstance => {
    const term = STANDARD[Math.floor(k / 3)] as number;
    if (k >= picked.length / 3) return { iid: c, code: c, term, status: 'planned' };
    const fail = r() < 0.05;
    return {
      iid: c,
      code: c,
      term,
      status: 'completed',
      outcome: fail ? 'fail' : 'pass',
      mark: fail ? 40 : 50 + Math.floor(r() * 50)
    };
  });
  if (r() < 0.3) {
    const at = Math.floor(r() * 6);
    for (let k = 0; k < 3; k++)
      plan.push({
        iid: `ENGG2600#${k}`,
        code: 'ENGG2600',
        term: STANDARD[at + k] as number,
        status: 'planned'
      });
  }
  const ignored = plan.filter(() => r() < 0.03).map((p) => p.iid);
  const summerTerms = Array.from({ length: 10 }, (_, y) => 4 * y + 1);
  return { program: code, year, selections, plan, ignored, summerTerms };
};

interface Finding {
  program: string;
  seed: number;
  kind: string;
  detail: string;
}

const check = (student: StudentState, ev: Evaluation, seed: number): Finding[] => {
  const out: Finding[] = [];
  const add = (kind: string, detail: string) =>
    out.push({ program: `${student.program}/${student.year}`, seed, kind, detail });
  const choices = new Map(
    [...ev.nodes.values()]
      .filter((n) => n.kind === 'group' && n.selected)
      .map((n) => [n.path, n.selected as string[]])
  );
  const tree = buildTree(bundle, {
    program: student.program,
    year: student.year,
    selections: student.selections ?? {},
    choices
  });
  if ('error' in tree) return out;
  const instOf = new Map(student.plan.map((p) => [p.iid, p]));
  const uocOf = (iid: string) => (/^ENGG[2-4]600$/.test(instOf.get(iid)?.code ?? '') ? 2 : 6);
  const eligible = (path: string, iid: string) => {
    const n = tree.nodes.get(path);
    const p = instOf.get(iid);
    if (!n?.pool || !p) return false;
    const facts = bundle.facts(p.code, p.year ?? student.year);
    return selectors.matches(n.pool.selector, { code: p.code, ...(facts ? { facts } : {}) }, n.doc);
  };
  const pools = [...ev.nodes.values()].filter((n) => n.kind === 'pool' && !n.inactive);
  // would `iid` fit the pool's own maximum and every quota maximum?
  const fits = (n: (typeof pools)[number], iid: string) => {
    if (n.counted_uoc + n.credited_uoc + uocOf(iid) > (n.required_uoc?.max ?? Infinity))
      return false;
    const node = tree.nodes.get(n.path);
    const match = (sel: Parameters<typeof selectors.matches>[0], x: string) => {
      const p = instOf.get(x);
      const facts = p && bundle.facts(p.code, p.year ?? student.year);
      return (
        !!p &&
        !!node &&
        selectors.matches(sel, { code: p.code, ...(facts ? { facts } : {}) }, node.doc)
      );
    };
    return (node?.pool?.quotas ?? []).every((q) => {
      if (!match(q.selector, iid)) return true;
      const held = n.allocations.filter((a) => a.kind !== 'credit' && match(q.selector, a.iid));
      const uoc = held.reduce((sum, a) => sum + uocOf(a.iid), 0) + uocOf(iid);
      return uoc <= (q.uoc.max ?? Infinity) && held.length + 1 <= (q.count.max ?? Infinity);
    });
  };

  // 1. a pool short while an eligible, uncounted course would fit
  for (const p of pools.filter((x) => x.status === 'unmet')) {
    const idle = ev.notCounted.filter((iid) => eligible(p.path, iid) && fits(p, iid));
    if (idle.length)
      add('idle-course-for-short-pool', `${p.path} short; unused: ${idle.join(' ')}`);
  }
  // 2. a core item unmet while an eligible course is not counted
  for (const c of [...ev.nodes.values()].filter((n) => n.kind === 'core' && n.status === 'unmet')) {
    // only the items reported unplanned (an item met by another alternative is not stranded)
    const items = (c.items ?? []).filter((item) =>
      c.reasons.some((r) => r.code === 'not_planned' && r.text.startsWith(`${item} `))
    );
    const idle = ev.notCounted.filter((iid) =>
      items.some((item) => item.split(/ or | and /).includes(instOf.get(iid)?.code ?? ''))
    );
    if (idle.length) add('idle-course-for-core', `${c.path}: unused ${idle.join(' ')}`);
  }
  // 3. counted + not counted = the plan
  const ignored = new Set(student.ignored ?? []);
  const total = student.plan
    .filter((p) => p.outcome !== 'fail' && !ignored.has(p.iid))
    .reduce((sum, p) => sum + uocOf(p.iid), 0);
  const notCounted = ev.notCounted.reduce((sum, iid) => sum + uocOf(iid), 0);
  if (ev.root.counted_uoc + notCounted !== total)
    add('uoc-balance', `counted ${ev.root.counted_uoc} + not counted ${notCounted} ≠ ${total}`);
  // 4. a short pool while another pool holds an eligible course it could spare; only when the plan
  // has enough UOC overall (otherwise something is short whichever way a course goes)
  const enough = ev.root.counted_uoc >= (ev.root.required_uoc?.min ?? 0);
  for (const p of pools.filter((x) => enough && x.status === 'unmet')) {
    for (const q of pools.filter((x) => x !== p)) {
      const spare = q.counted_uoc - (q.required_uoc?.min ?? 0);
      const role = q.role ?? 'elective';
      const movable = q.allocations
        .filter((a) => a.kind === 'primary' && eligible(p.path, a.iid))
        .filter((a) => spare >= uocOf(a.iid) || role === 'free_elective')
        .filter((a) => fits(p, a.iid));
      if (movable.length)
        add(
          'spare-course-elsewhere',
          `${p.path} short (${p.counted_uoc}/${p.required_uoc?.min}); ${q.path} could spare ${movable.map((a) => a.iid).join(' ')}`
        );
    }
  }
  return out;
};

const SEEDS = 30; // 870 plans, about a second; raise it locally for a deeper search

describe('allocation invariants over generated plans', () => {
  it('finds no stranded courses', () => {
    const findings: Finding[] = [];
    let plans = 0;
    for (const { code, year } of programs) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const student = planFor(code, year, seed * 7919 + Number(code));
        const ev = evaluate(bundle, student);
        plans += 1;
        findings.push(...check(student, ev, seed));
      }
    }
    expect(plans).toBe(programs.length * SEEDS);
    // one finding per program and kind is enough to diagnose
    expect(findings.map((f) => `${f.kind} ${f.program} seed ${f.seed}: ${f.detail}`)).toEqual([]);
  }, 600_000);
});
