// Evaluation entry points (SCHEMA.md §7; EVALUATOR.md §3): evaluate, checkInstance, unlockedAt,
// explain.
import type { Condition } from '../lang/ast';
import { parseCoreItem } from '../lang/core-item';
import { normalizeSelector } from '../lang/normalize';
import type { Diagnostic } from '../load';
import type { Bundle } from '../resolve/bundle';
import type { Alternative, CoreItemIR, IRNode, Tree } from '../ir/tree';
import { buildTree, resolvePath, toRange, within } from '../ir/tree';
import type { Allocation, TraceEvent } from './allocate';
import { allocate } from './allocate';
import type { World } from './conditions';
import { Conditions, kleeneAnd, result } from './conditions';
import type { Inst } from './context';
import { makeInstances, Selectors } from './context';
import type { Statuses } from './status';
import { computeStatuses, conditionOf } from './status';
import type { ConditionResult, Evaluation, InstanceAllocation, NodeResult, StudentState, Tri, UocRange } from './types';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

interface Run {
  tree: Tree;
  insts: Inst[];
  world: World;
  conds: Conditions;
  alloc: Allocation;
  statuses: Statuses;
  rootUoc: UocRange;
}

interface Internals {
  bundle: Bundle;
  student: StudentState;
  run: Run;
}

const internals = new WeakMap<Evaluation, Internals>();

// §7.2 steps 4–5: substitutions add alternatives, exemptions satisfy items (provisionally when
// their `when` is unknown). Returns the program uoc after exemption reductions.
const applyRules = (run: Omit<Run, 'alloc' | 'statuses' | 'rootUoc'>, bundle: Bundle, year: number): UocRange => {
  const { tree, conds, world } = run;
  const when = (raw: Obj, doc: Tree['root']['doc']): Tri => {
    if (raw.when === undefined) return 'met';
    const c = conditionOf(raw.when);
    return c ? conds.evaluate(c, { term: Infinity, static: true, doc }).status : 'unknown';
  };
  const scoped = (raw: Obj, doc: Tree['root']['doc']) =>
    typeof raw.scope === 'string' ? resolvePath(tree, raw.scope, doc).nodes : [tree.root];
  const inScope = (it: CoreItemIR, scope: IRNode[]) => scope.some((s) => within(it.node, s));
  const names = (it: CoreItemIR, code: string) => it.alternatives.some((alt) => alt.codes.includes(code));

  for (const { raw, doc } of tree.substitutions) {
    const w = when(raw, doc);
    if (w !== 'unmet' && typeof raw.replace === 'string' && typeof raw.with === 'string') {
      let item;
      try {
        item = parseCoreItem(raw.with, { allowPatterns: true });
      } catch {
        item = undefined;
      }
      if (item !== undefined) {
        const alt = (codes: string[], and: boolean): Alternative => ({
          codes,
          and,
          pattern: codes.some((c) => c.includes('*')),
          substituted: true,
          provisional: w === 'unknown'
        });
        const alts =
          typeof item === 'string' ? [alt([item], false)] : 'or' in item ? item.or.map((c) => alt([c], false)) : [alt(item.and, true)];
        const scope = scoped(raw, doc);
        for (const it of world.coreItems) if (inScope(it, scope) && names(it, raw.replace)) it.alternatives.push(...alts);
      }
    }
  }
  const rootUoc = { ...(tree.root.uoc ?? {}) };
  for (const { raw, doc } of tree.exemptions) {
    const w = when(raw, doc);
    if (w !== 'unmet') {
      const scope = scoped(raw, doc);
      for (const code of (Array.isArray(raw.courses) ? raw.courses : []).map(String)) {
        for (const it of world.coreItems) {
          if (inScope(it, scope) && names(it, code) && !it.exempt) {
            it.exempt = { provisional: w === 'unknown' };
            if (raw.reduce_uoc !== false) {
              const uoc = bundle.facts(code, year)?.uoc ?? 0;
              // the enclosing node with a declared uoc, and the program total
              for (let cur = it.node.parent; cur; cur = cur.parent) {
                if (cur.uoc && cur !== tree.root) {
                  cur.uoc = { ...cur.uoc, ...(cur.uoc.min !== undefined ? { min: cur.uoc.min - uoc } : {}) };
                  break;
                }
              }
              if (rootUoc.min !== undefined) rootUoc.min -= uoc;
              if (rootUoc.max !== undefined) rootUoc.max -= uoc;
            }
          }
        }
      }
    }
  }
  return rootUoc;
};

const runOnce = (
  bundle: Bundle,
  student: StudentState,
  choices: ReadonlyMap<string, string[]>,
  depth = 0
): Run | { error: string } => {
  const tree = buildTree(bundle, {
    program: student.program,
    year: student.year,
    selections: student.selections ?? {},
    choices
  });
  if ('error' in tree) return tree;
  const insts = makeInstances(bundle, student);
  const selectors = new Selectors(bundle);
  const coreItems = tree.active.flatMap((n) => n.items ?? []);
  const world: World = { bundle, tree, insts, student, selectors, coreItems };
  const conds = new Conditions(world);
  const rootUoc = applyRules({ tree, insts, world, conds }, bundle, tree.program.year);
  const alloc = allocate(bundle, tree, insts, selectors, coreItems);

  // post-allocation: in: membership and complete()
  world.inMember = (i, path, doc) => {
    const targets = [alloc.primary[i.idx], ...(alloc.shares[i.idx] ?? [])].filter((x): x is IRNode => x !== undefined);
    return resolvePath(tree, path, doc).nodes.some((n) => targets.some((t) => within(t, n)));
  };
  const memo = new Map<string, Tri>();
  world.complete = (node, term) => {
    const key = `${node.path}@${term}`;
    if (!memo.has(key)) {
      memo.set(key, 'unknown'); // re-entrant complete() inside the sub-run reads unknown
      if (depth < 2) {
        const before: StudentState = {
          ...student,
          plan: student.plan.filter((p) => p.term < term)
        };
        const sub = runOnce(bundle, before, choices, depth + 1);
        memo.set(key, 'error' in sub ? 'unknown' : (sub.statuses.results.get(node.path)?.status ?? 'unknown'));
      }
    }
    return memo.get(key) as Tri;
  };
  const statuses = computeStatuses(world, conds, tree, alloc, insts, rootUoc);
  return { tree, insts, world, conds, alloc, statuses, rootUoc };
};

// §7.5 criteria: fewest unmet nodes (+1 if the root total fails), fewest unknown, most root UOC
const SCORED = new Set(['core', 'pool', 'limit', 'maturity', 'timing', 'check']);
const score = (run: Run): number[] => {
  const counted = [...run.statuses.results.values()].filter(
    (r) => !r.inactive && (SCORED.has(r.kind) || (r.kind === 'info' && !r.inactive))
  );
  const unmet = counted.filter((r) => r.status === 'unmet').length + (run.statuses.rootUocFails ? 1 : 0);
  const unknown = counted.filter((r) => r.status === 'unknown').length;
  return [unmet, unknown, -(run.statuses.results.get('root')?.counted_uoc ?? 0)];
};

const subsets = (n: number, min: number, max: number): number[][] => {
  const out: number[][] = [];
  const rec = (start: number, cur: number[]) => {
    if (cur.length >= min && cur.length <= max) out.push([...cur]);
    if (cur.length === max) return;
    for (let i = start; i < n; i++) rec(i + 1, [...cur, i]);
  };
  rec(0, []);
  // lexicographic order of pre-order index lists; at most 64 (§7.5)
  return out
    .sort((a, b) => {
      for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return (a[i] ?? 0) - (b[i] ?? 0);
      return a.length - b.length;
    })
    .slice(0, 64);
};

// Fixed choices for every unselected choice group, one group at a time in pre-order (§7.5).
const autoChoose = (bundle: Bundle, student: StudentState): { choices: Map<string, string[]>; diagnostics: Diagnostic[] } => {
  const choices = new Map<string, string[]>();
  const diagnostics: Diagnostic[] = [];
  for (let guard = 0; guard < 32; guard++) {
    const probe = runOnce(bundle, student, choices);
    if ('error' in probe) break;
    const group = probe.tree.unselectedChoices.find((g) => !choices.has(g.path));
    if (!group) break;
    const range = group.choose ?? {};
    const options = subsets(group.children.length, range.min ?? 0, range.max ?? group.children.length);
    // later unselected groups temporarily take their first enumerated subset
    const firstOf = (g: IRNode) => (subsets(g.children.length, g.choose?.min ?? 0, g.choose?.max ?? g.children.length)[0] ?? []).map((k) => g.children[k]?.id as string);
    let best: { s: number[]; ids: string[] } | undefined;
    for (const opt of options) {
      const ids = opt.map((k) => group.children[k]?.id as string);
      const trial = new Map(choices);
      trial.set(group.path, ids);
      for (const g of probe.tree.unselectedChoices) if (!trial.has(g.path)) trial.set(g.path, firstOf(g));
      const run = runOnce(bundle, student, trial);
      if (!('error' in run)) {
        const s = score(run);
        const k = best ? s.findIndex((v, j) => v !== best?.s[j]) : -1;
        const better = !best || (k >= 0 && (s[k] ?? 0) < (best.s[k] ?? 0));
        if (better) best = { s, ids };
      }
    }
    choices.set(group.path, best?.ids ?? []);
    diagnostics.push({ level: 'info', code: 'AUTO_SELECTED', path: group.path, message: `${group.path}: auto-selected ${best?.ids.join(', ') || 'none'} (§7.5)` });
  }
  return { choices, diagnostics };
};

export interface EvaluateOptions {
  trace?: boolean;
}

export const evaluate = (bundle: Bundle, student: StudentState, opts: EvaluateOptions = {}): Evaluation => {
  const { choices, diagnostics } = autoChoose(bundle, student);
  const run = runOnce(bundle, student, choices);
  if ('error' in run) {
    const root: NodeResult = { path: 'root', id: 'root', kind: 'root', status: 'unknown', projected: false, counted_uoc: 0, credited_uoc: 0, allocations: [], reasons: [{ code: 'unresolved_path', text: run.error }], warnings: [], children: [] };
    return {
      program: { code: student.program, year: student.year, yearFallback: false },
      root,
      nodes: new Map([['root', root]]),
      instances: new Map(),
      notCounted: [],
      diagnostics: [...bundle.diagnostics, { level: 'error', code: 'PROGRAM_NOT_FOUND', message: run.error }]
    };
  }
  const { tree, insts, alloc, statuses, conds } = run;
  const instances = new Map<string, InstanceAllocation>();
  for (const i of insts) {
    const failedOn = [...alloc.failedOn.entries()].filter(([, xs]) => xs.includes(i)).map(([n]) => n.path);
    instances.set(i.iid, {
      primary: alloc.primary[i.idx]?.path ?? null,
      ...(alloc.replaces[i.idx] ? { replacement: true } : {}),
      shares: (alloc.shares[i.idx] ?? []).map((n) => n.path),
      credits: alloc.credits[i.idx] ? [(alloc.credits[i.idx] as IRNode).path] : [],
      ...(failedOn.length ? { failedOn } : {})
    });
  }
  const entryCond = tree.program.data.entry === undefined ? undefined : conditionOf(tree.program.data.entry);
  const classes = (Array.isArray(tree.program.data.classes) ? tree.program.data.classes : []).filter(isObj);
  let awardClass: string | null | undefined;
  if (classes.length) {
    awardClass = null;
    for (const c of classes) {
      const cond = conditionOf(c.require);
      if (awardClass === null && cond && conds.evaluate(cond, { term: Infinity, doc: tree.root.doc }).status === 'met') awardClass = String(c.name);
    }
  }
  const ev: Evaluation = {
    program: {
      code: tree.program.code,
      year: tree.program.year,
      yearFallback: tree.program.yearFallback,
      ...(typeof tree.program.data.title === 'string' ? { title: tree.program.data.title } : {})
    },
    root: statuses.results.get('root') as NodeResult,
    nodes: statuses.results,
    instances,
    notCounted: alloc.notCounted.map((i) => i.iid),
    ...(entryCond ? { entry: conds.evaluate(entryCond, { term: Infinity, static: true, doc: tree.root.doc }) } : {}),
    ...(awardClass !== undefined ? { awardClass } : {}),
    diagnostics: [
      ...bundle.diagnostics,
      ...tree.diagnostics,
      ...diagnostics,
      ...[...alloc.poolOverflow].map((p): Diagnostic => ({ level: 'warning', code: 'POOL_SEARCH_BUDGET', path: p.path, message: `${p.path}: too many candidate combinations; reported unknown` }))
    ]
  };
  if (!opts.trace) alloc.trace.length = 0;
  internals.set(ev, { bundle, student, run });
  return ev;
};

const internalsOf = (ev: Evaluation): Internals => {
  const x = internals.get(ev);
  if (!x) throw new Error('not an Evaluation returned by evaluate()');
  return x;
};

// effective(C) (§3.3): requires per status, and every exclusion as ¬x′
const effective = (x: Internals, i: Inst): ConditionResult => {
  const { bundle, run } = x;
  const entry = bundle.courseEntry(i.code, i.year);
  if (!entry) return result('unknown', true, [{ code: 'no_condition_data', text: `no condition data for ${i.code}` }]);
  const point = { term: i.term, self: i, doc: run.tree.root.doc };
  const status = String(entry.data.status ?? 'parsed');
  let req: ConditionResult;
  if (status === 'none') req = result('met');
  else if (status === 'manual' || status === 'unparsed') {
    req = result('unknown', false, [{ code: 'requires_unknown', text: String(entry.data.original ?? 'needs manual review') }]);
  } else {
    const c = entry.data.requires === undefined ? true : conditionOf(entry.data.requires);
    const r = c === undefined ? result('unknown') : run.conds.evaluate(c as Condition, point);
    req = { ...r, reasons: r.status === 'met' ? r.reasons : [{ code: r.status === 'unmet' ? 'requires_unmet' : 'requires_unknown', text: `prerequisite ${r.status}` }, ...r.reasons] };
  }
  const exclusions = (Array.isArray(entry.data.excludes) ? entry.data.excludes : []).map((ex): ConditionResult => {
    const code = isObj(ex) ? String(ex.course ?? ex.code ?? '') : String(ex);
    const c: Condition | undefined = /^[A-Z]{4}[0-9]{4}$/.test(code) ? { planned: code } : conditionOf(code);
    if (!c) return result('met');
    const r = run.conds.evaluate(c, point);
    const flip: Record<Tri, Tri> = { met: 'unmet', unmet: 'met', unknown: 'unknown' };
    return {
      ...r,
      status: flip[r.status],
      reasons: r.status === 'unmet' ? [] : [{ code: 'excluded', text: `excluded by ${code}`, ...(r.reasons[0]?.iids ? { iids: r.reasons[0].iids } : {}) }]
    };
  });
  return kleeneAnd([req, ...exclusions]);
};

const maturityFor = (x: Internals, i: Inst): ConditionResult[] => {
  const { run } = x;
  return run.tree.active
    .filter((n) => n.kind === 'maturity')
    .flatMap((n) => {
      const r = run.statuses.results.get(n.path);
      const mine = r?.reasons.filter((rs) => rs.iids?.includes(i.iid)) ?? [];
      const applies = conditionOf(n.raw.require);
      if (!applies) return [];
      let sel;
      try {
        sel = normalizeSelector(n.raw.applies_to).ast;
      } catch {
        return [];
      }
      const matched = run.world.selectors.matches(sel, { code: i.code, ...(i.facts ? { facts: i.facts } : {}), inst: i }, n.doc, run.world.inMember);
      if (!matched) return [];
      const res = run.conds.evaluate(applies, { term: i.term, self: i, doc: n.doc });
      return [{ ...res, reasons: mine.length ? mine : res.reasons }];
    });
};


// §7.7: effective(C) ∧ every maturity node whose applies_to matches the instance, at τ(i).
export const checkInstance = (ev: Evaluation, iid: string): ConditionResult => {
  const x = internalsOf(ev);
  const i = x.run.insts.find((y) => y.iid === iid);
  if (!i) return result('unknown', false, [{ code: 'unresolved_path', text: `no plan instance ${iid}` }]);
  const r = kleeneAnd([effective(x, i), ...maturityFor(x, i)]);
  // the result is about i itself, so a planned or pending i is always projected (§7.7)
  return { ...r, projected: r.projected || i.projected };
};

// Unlock results for hypothetical planned instances of `codes` in `term` (§7.7).
export const unlockedAt = (ev: Evaluation, term: number, codes: string[]): Map<string, ConditionResult> => {
  const x = internalsOf(ev);
  const out = new Map<string, ConditionResult>();
  const year = x.student.year;
  for (const code of codes) {
    const facts = x.bundle.facts(code, year);
    const i: Inst = { idx: -1, iid: `?${code}`, code, term, year, completed: false, ...(facts ? { facts } : {}), uoc: facts?.uoc ?? 0, ignored: false, failed: false, projected: true, active: true };
    const r = kleeneAnd([effective(x, i), ...maturityFor(x, i)]);
    out.set(code, { ...r, projected: true });
  }
  return out;
};

export type ExplainEvent = TraceEvent | { step: 'status'; node: string; status: Tri; because: NodeResult['reasons'] };

// The allocation trace for a node or an instance (needs evaluate(…, { trace: true })), plus the
// node's status and reasons.
export const explain = (ev: Evaluation, target: { path: string } | { iid: string }): ExplainEvent[] => {
  const { run } = internalsOf(ev);
  if ('iid' in target) return run.alloc.trace.filter((e) => e.iid === target.iid);
  const events: ExplainEvent[] = run.alloc.trace.filter((e) => e.node === target.path);
  const r = ev.nodes.get(target.path);
  if (r) events.push({ step: 'status', node: r.path, status: r.status, because: r.reasons });
  return events;
};

// The node a §4.1 path names, resolved against the program (fixture expectations, UI links).
export const nodeAt = (ev: Evaluation, path: string): NodeResult | undefined => {
  const direct = ev.nodes.get(path);
  if (direct) return direct;
  const { run } = internalsOf(ev);
  const found = resolvePath(run.tree, path, run.tree.root.doc).nodes[0];
  return found ? ev.nodes.get(found.path) : undefined;
};

export { toRange };
