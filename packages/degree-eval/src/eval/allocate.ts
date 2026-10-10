// The reference allocation algorithm (SCHEMA.md §7.4), step by step.
import type { Selector } from '../lang/ast';
import { normalizeSelector } from '../lang/normalize';
import type { CoreItemIR, DocCtx, IRNode, Rule, Tree } from '../ir/tree';
import { resolvePath, within } from '../ir/tree';
import type { Bundle } from '../resolve/bundle';
import type { Course, Inst, Selectors } from './context';
import { equivalent, patternMatches } from './context';
import type { Dimension } from './dp';
import { BudgetExceeded, choose } from './dp';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export interface TraceEvent {
  step: '1a' | '1b' | '1c' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  node: string;
  iid?: string;
  action: string;
  why: string;
}

export interface ItemSat {
  kind: 'primary' | 'share' | 'replacement' | 'and';
  insts: Inst[];
  provisional: boolean; // satisfied only through a provisional (substituted) alternative
}

export interface ShareIR {
  index: number;
  doc: DocCtx;
  sides: [IRNode[], IRNode[]];
  courses?: Selector;
  budget: number; // remaining max_uoc (Infinity without one)
  targets: 'any' | 'core';
  mode: 'both' | 'replace';
  replacementFrom?: Selector;
  sameOrHigher: boolean;
}

export interface Allocation {
  primary: (IRNode | undefined)[]; // by canonical instance index
  replaces: (Inst | undefined)[]; // a replacement allocation: the instance it replaces (step 3)
  shares: IRNode[][];
  credits: (IRNode | undefined)[];
  itemSat: Map<string, ItemSat>;
  replacementMissing: Set<string>; // core item keys
  overlap: Map<string, { inst: Inst; q: IRNode }>; // step 9 overlap_undeclared, by item key
  missingOn: Map<IRNode, Inst[]>; // catalogue_missing instances eligible by code (§7.3)
  failedOn: Map<IRNode, Inst[]>; // failed instances eligible for the node (§7.3)
  poolOverflow: Set<IRNode>; // pool search exceeded its cell budget: reported unknown
  notCounted: Inst[];
  rules: ShareIR[];
  trace: TraceEvent[];
}

const ROLE_RANK = { elective: 0, gen_ed: 1, free_elective: 2 };

export const allocate = (
  bundle: Bundle,
  tree: Tree,
  insts: Inst[],
  selectors: Selectors,
  coreItems: CoreItemIR[]
): Allocation => {
  const n = insts.length;
  const a: Allocation = {
    primary: Array.from({ length: n }, () => undefined),
    replaces: Array.from({ length: n }, () => undefined),
    shares: Array.from({ length: n }, () => []),
    credits: Array.from({ length: n }, () => undefined),
    itemSat: new Map(),
    replacementMissing: new Set(),
    overlap: new Map(),
    missingOn: new Map(),
    failedOn: new Map(),
    poolOverflow: new Set(),
    notCounted: [],
    rules: [],
    trace: []
  };
  const trace = (e: TraceEvent) => a.trace.push(e);
  const course = (i: Inst): Course => ({ code: i.code, ...(i.facts ? { facts: i.facts } : {}), inst: i });
  const matches = (s: Selector, i: Inst, doc: DocCtx) => selectors.matches(s, course(i), doc);

  // ---- eligibility (§7.3) ----
  const pinned = new Map<Inst, IRNode | undefined>();
  const pinOk = (i: Inst, node: IRNode) => {
    if (!i.pin) return true;
    if (!pinned.has(i)) pinned.set(i, resolvePath(tree, i.pin, tree.root.doc).nodes[0]);
    return pinned.get(i) === node;
  };
  const altMatches = (i: Inst, code: string, pattern: boolean) =>
    pattern ? patternMatches(code, i.code) : equivalent(bundle, i.code, code, i.year);
  const forItem = (i: Inst, it: CoreItemIR, alt?: CoreItemIR['alternatives'][number]) =>
    i.active &&
    i.facts !== undefined &&
    pinOk(i, it.node) &&
    (alt ? [alt] : it.alternatives).some((x) => !x.and && altMatches(i, x.codes[0] as string, x.pattern));
  const forPool = (i: Inst, p: IRNode) =>
    i.active && i.facts !== undefined && pinOk(i, p) && matches((p.pool as NonNullable<IRNode['pool']>).selector, i, p.doc);
  const free = (i: Inst) => a.primary[i.idx] === undefined;

  // ---- share rules (program rules, then hoisted spec rules in pre-order) ----
  a.rules = tree.shares.map((r: Rule, index): ShareIR => {
    const side = (p: unknown) => (typeof p === 'string' ? resolvePath(tree, p, r.doc).nodes : []);
    const between = Array.isArray(r.raw.between) ? r.raw.between : [];
    const sel = (v: unknown) => {
      try {
        return v === undefined ? undefined : normalizeSelector(v).ast;
      } catch {
        return undefined;
      }
    };
    const rep = isObj(r.raw.replacement) ? r.raw.replacement : {};
    const courses = sel(r.raw.courses);
    const replacementFrom = sel(rep.from);
    return {
      index,
      doc: r.doc,
      sides: [side(between[0]), side(between[1])],
      ...(courses ? { courses } : {}),
      budget: typeof r.raw.max_uoc === 'number' ? r.raw.max_uoc : Infinity,
      targets: r.raw.targets === 'core' ? 'core' : 'any',
      mode: r.raw.mode === 'replace' ? 'replace' : 'both',
      ...(replacementFrom ? { replacementFrom } : {}),
      sameOrHigher: rep.level === 'same_or_higher'
    };
  });
  const inSide = (r: ShareIR, k: 0 | 1, x: IRNode) => r.sides[k].some((s) => within(x, s));
  const covers = (r: ShareIR, x: IRNode, y: IRNode) =>
    (inSide(r, 0, x) && inSide(r, 1, y)) || (inSide(r, 1, x) && inSide(r, 0, y));
  const courseOk = (r: ShareIR, i: Inst) => !r.courses || matches(r.courses, i, r.doc);

  // ---- pools in canonical order (§7.4) ----
  const pools = tree.active.filter((x) => x.kind === 'pool' && x.pool);
  const base = [...pools].sort((x, y) => {
    const px = x.pool as NonNullable<IRNode['pool']>;
    const py = y.pool as NonNullable<IRNode['pool']>;
    return ROLE_RANK[px.role] - ROLE_RANK[py.role] || Number(px.overflow) - Number(py.overflow) || x.pre - y.pre;
  });
  // `priority` re-seats one document's pools within the positions they already occupy
  const ordered = [...base];
  for (const key of new Set(base.map((p) => p.doc.key))) {
    const positions = base.map((p, i) => (p.doc.key === key ? i : -1)).filter((i) => i >= 0);
    const mine = positions
      .map((i) => base[i] as IRNode)
      .sort((x, y) => (x.pool?.priority ?? 0) - (y.pool?.priority ?? 0) || base.indexOf(x) - base.indexOf(y));
    positions.forEach((pos, k) => {
      ordered[pos] = mine[k] as IRNode;
    });
  }

  // ---- pool bookkeeping ----
  const members = (p: IRNode) => insts.filter((i) => a.primary[i.idx] === p || a.shares[i.idx]?.includes(p));
  interface Held {
    uoc: number;
    count: number;
    quotas: { uoc: number; count: number }[];
  }
  const heldOf = (p: IRNode, without?: Inst): Held => {
    const pool = p.pool as NonNullable<IRNode['pool']>;
    const ms = members(p).filter((i) => i !== without);
    return {
      uoc: ms.reduce((s, i) => s + i.uoc, 0),
      count: ms.length,
      quotas: pool.quotas.map((q) => {
        const qs = ms.filter((i) => matches(q.selector, i, p.doc));
        return { uoc: qs.reduce((s, i) => s + i.uoc, 0), count: qs.length };
      })
    };
  };
  const belowMin = (p: IRNode, h: Held = heldOf(p)) => {
    const pool = p.pool as NonNullable<IRNode['pool']>;
    return (
      h.uoc < (pool.uoc.min ?? 0) ||
      h.count < (pool.count.min ?? 0) ||
      pool.quotas.some((q, k) => (h.quotas[k]?.uoc ?? 0) < (q.uoc.min ?? 0) || (h.quotas[k]?.count ?? 0) < (q.count.min ?? 0))
    );
  };
  const hasMax = (p: IRNode) => {
    const pool = p.pool as NonNullable<IRNode['pool']>;
    return pool.uoc.max !== undefined || pool.count.max !== undefined || pool.quotas.some((q) => q.uoc.max !== undefined || q.count.max !== undefined);
  };
  const fitsMax = (p: IRNode, add: Inst[]) => {
    const pool = p.pool as NonNullable<IRNode['pool']>;
    const h = heldOf(p);
    const uoc = h.uoc + add.reduce((s, i) => s + i.uoc, 0);
    if (pool.uoc.max !== undefined && uoc > pool.uoc.max) return false;
    if (pool.count.max !== undefined && h.count + add.length > pool.count.max) return false;
    return pool.quotas.every((q, k) => {
      const qs = add.filter((i) => matches(q.selector, i, p.doc));
      return (
        (q.uoc.max === undefined || (h.quotas[k]?.uoc ?? 0) + qs.reduce((s, i) => s + i.uoc, 0) <= q.uoc.max) &&
        (q.count.max === undefined || (h.quotas[k]?.count ?? 0) + qs.length <= q.count.max)
      );
    });
  };

  // ---- core-item bookkeeping ----
  const items = coreItems.filter((it) => !it.node.inactive && !it.exempt);
  const unsatisfied = () => items.filter((it) => !a.itemSat.has(it.key));
  const satisfiedVia = (it: CoreItemIR, i: Inst) => {
    const alt = it.alternatives.find((x) => !x.and && altMatches(i, x.codes[0] as string, x.pattern));
    return alt?.provisional === true && !it.alternatives.some((x) => !x.provisional && !x.and && altMatches(i, x.codes[0] as string, x.pattern));
  };

  // criterion 6: other core items and non-overflow pools x is eligible for that are still below min
  const scarcity = (i: Inst, self: IRNode) =>
    unsatisfied().filter((it) => forItem(i, it)).length +
    ordered.filter((p) => p !== self && !p.pool?.overflow && belowMin(p) && forPool(i, p)).length;

  // The exact choice for pool P from `cands` (step 2/5 order, or step 4 top-up), with extra max
  // dimensions for share-rule budgets (step 5).
  const pick = (p: IRNode, cands: Inst[], mode: 'fill' | 'topup', budgets: Dimension[] = []): Inst[] => {
    const pool = p.pool as NonNullable<IRNode['pool']>;
    const h = heldOf(p);
    const dims: Dimension[] = [
      { kind: 'uoc', contrib: cands.map((i) => i.uoc), held: h.uoc, ...pool.uoc },
      { kind: 'count', contrib: cands.map(() => 1), held: h.count, ...pool.count },
      ...pool.quotas.flatMap((q, k): Dimension[] => {
        const inQ = cands.map((i) => matches(q.selector, i, p.doc));
        return [
          { kind: 'uoc', contrib: cands.map((i, j) => (inQ[j] ? i.uoc : 0)), held: h.quotas[k]?.uoc ?? 0, ...q.uoc },
          { kind: 'count', contrib: cands.map((_, j) => (inQ[j] ? 1 : 0)), held: h.quotas[k]?.count ?? 0, ...q.count }
        ];
      }),
      ...budgets
    ];
    try {
      return choose({ dims, weights: cands.map((i) => scarcity(i, p)), mode }).map((k) => cands[k] as Inst);
    } catch (e) {
      if (!(e instanceof BudgetExceeded)) throw e;
      a.poolOverflow.add(p);
      return [];
    }
  };

  const fill = (p: IRNode, step: '2' | '7') => {
    const cands = insts.filter((i) => free(i) && forPool(i, p));
    for (const i of pick(p, cands, 'fill')) {
      a.primary[i.idx] = p;
      trace({ step, node: p.path, iid: i.iid, action: 'primary', why: 'exact minimum fill' });
    }
  };
  const topUp = (p: IRNode, step: '4' | '6') => {
    const cands = insts.filter((i) => free(i) && forPool(i, p));
    for (const i of pick(p, cands, 'topup')) {
      a.primary[i.idx] = p;
      trace({ step, node: p.path, iid: i.iid, action: 'primary', why: step === '4' ? 'exact top-up' : 'overflow' });
    }
  };

  // ---- 1a. core matching: Kuhn's augmenting paths in canonical order ----
  const matchOf = new Map<number, CoreItemIR>(); // instance → item
  const cands = new Map<string, Inst[]>();
  for (const it of items) {
    const list: Inst[] = [];
    for (const alt of it.alternatives.filter((x) => !x.and)) {
      for (const i of insts) if (!list.includes(i) && forItem(i, it, alt)) list.push(i);
    }
    cands.set(it.key, list);
  }
  const augment = (it: CoreItemIR, seen: Set<number>): boolean => {
    for (const i of cands.get(it.key) ?? []) {
      if (!seen.has(i.idx)) {
        seen.add(i.idx);
        const other = matchOf.get(i.idx);
        if (!other || augment(other, seen)) {
          matchOf.set(i.idx, it);
          return true;
        }
      }
    }
    return false;
  };
  for (const it of items) augment(it, new Set());
  for (const [idx, it] of matchOf) {
    const i = insts[idx] as Inst;
    a.primary[idx] = it.node;
    a.itemSat.set(it.key, { kind: 'primary', insts: [i], provisional: satisfiedVia(it, i) });
    trace({ step: '1a', node: it.node.path, iid: i.iid, action: 'primary', why: `core item ${it.written}` });
  }

  // ---- 1b. shares for core items ----
  for (const it of unsatisfied()) {
    let done = false;
    for (const i of insts) {
      const q = a.primary[i.idx];
      if (!done && q && q !== it.node && forItem(i, it)) {
        const rule = a.rules.find((r) => r.mode === 'both' && covers(r, it.node, q) && courseOk(r, i) && r.budget >= i.uoc);
        if (rule) {
          rule.budget -= i.uoc;
          a.shares[i.idx]?.push(it.node);
          a.itemSat.set(it.key, { kind: 'share', insts: [i], provisional: satisfiedVia(it, i) });
          trace({ step: '1b', node: it.node.path, iid: i.iid, action: 'share', why: `share rule ${rule.index} covers ${it.node.path} and ${q.path}` });
          done = true;
        }
      }
    }
  }

  // ---- 1c. and-alternatives ----
  for (const it of unsatisfied()) {
    for (const alt of it.alternatives.filter((x) => x.and)) {
      if (!a.itemSat.has(it.key)) {
        const chosen: Inst[] = [];
        for (const code of alt.codes) {
          const i = insts.find((x) => free(x) && !chosen.includes(x) && x.active && x.facts && pinOk(x, it.node) && altMatches(x, code, alt.pattern));
          if (i) chosen.push(i);
        }
        if (chosen.length === alt.codes.length) {
          for (const i of chosen) {
            a.primary[i.idx] = it.node;
            trace({ step: '1c', node: it.node.path, iid: i.iid, action: 'primary', why: `and-alternative ${alt.codes.join(' and ')}` });
          }
          a.itemSat.set(it.key, { kind: 'and', insts: chosen, provisional: alt.provisional });
        }
      }
    }
  }

  // ---- 2. exact pool minimum fill ----
  for (const p of ordered) if (!p.pool?.overflow && belowMin(p)) fill(p, '2');

  // ---- 3. replacement for mode: replace shares ----
  for (const it of unsatisfied()) {
    let found: { x: Inst; rule: ShareIR } | undefined;
    for (const x of insts) {
      const q = a.primary[x.idx];
      if (!found && q && forItem(x, it)) {
        const rule = a.rules.find((r) => r.mode === 'replace' && covers(r, it.node, q) && courseOk(r, x));
        if (rule) found = { x, rule };
      }
    }
    if (found) {
      const { x, rule } = found;
      const side = inSide(rule, 0, it.node) ? rule.sides[0] : rule.sides[1];
      const sidePools = rule.replacementFrom ? [] : pools.filter((p) => side.some((s) => within(p, s)));
      const level = (code: string) => Number(code[4]);
      const y = insts.find(
        (c) =>
          free(c) &&
          c.active &&
          c.facts !== undefined &&
          (rule.replacementFrom ? matches(rule.replacementFrom, c, rule.doc) : sidePools.some((p) => matches((p.pool as NonNullable<IRNode['pool']>).selector, c, p.doc))) &&
          (!rule.sameOrHigher || level(c.code) >= level(x.code))
      );
      if (y) {
        a.primary[y.idx] = it.node;
        a.replaces[y.idx] = x;
        a.itemSat.set(it.key, { kind: 'replacement', insts: [y], provisional: false });
        trace({ step: '3', node: it.node.path, iid: y.iid, action: 'replacement', why: `replaces ${x.code} (share rule ${rule.index}, mode: replace)` });
      } else {
        a.replacementMissing.add(it.key);
        trace({ step: '3', node: it.node.path, iid: x.iid, action: 'replacement_missing', why: `${x.code} counts elsewhere and no replacement elective is planned` });
      }
    }
  }

  // ---- 4. exact top-up ----
  for (const p of ordered) if (!p.pool?.overflow && hasMax(p)) topUp(p, '4');

  // ---- 5. shares for pools ----
  for (const p of ordered) {
    if (!p.pool?.overflow && belowMin(p)) {
      const bound: { i: Inst; rule: ShareIR }[] = [];
      for (const i of insts) {
        const q = a.primary[i.idx];
        if (q && q !== p && !a.shares[i.idx]?.includes(p) && forPool(i, p)) {
          const rule = a.rules.find((r) => r.mode === 'both' && r.targets === 'any' && covers(r, p, q) && courseOk(r, i));
          if (rule) bound.push({ i, rule });
        }
      }
      const rulesUsed = [...new Set(bound.map((b) => b.rule))];
      const budgets: Dimension[] = rulesUsed
        .filter((r) => r.budget !== Infinity)
        .map((r) => ({ kind: 'uoc', contrib: bound.map((b) => (b.rule === r ? b.i.uoc : 0)), held: 0, max: r.budget }));
      for (const i of pick(p, bound.map((b) => b.i), 'fill', budgets)) {
        const rule = (bound.find((b) => b.i === i) as { rule: ShareIR }).rule;
        rule.budget -= i.uoc;
        a.shares[i.idx]?.push(p);
        trace({ step: '5', node: p.path, iid: i.iid, action: 'share', why: `share rule ${rule.index} covers ${p.path} and ${(a.primary[i.idx] as IRNode).path}` });
      }
    }
  }

  // ---- 6. overflow ----
  for (const p of ordered) {
    if (p.pool?.overflow) {
      if (hasMax(p)) topUp(p, '6');
      else {
        for (const i of insts.filter((x) => free(x) && forPool(x, p))) {
          a.primary[i.idx] = p;
          trace({ step: '6', node: p.path, iid: i.iid, action: 'primary', why: 'overflow' });
        }
      }
    }
  }

  // ---- 7. repair ----
  const moved = new Set<number>();
  const staysMet = (q: IRNode, x: Inst) => {
    if (q.pool?.overflow) return true;
    if (q.kind !== 'pool') return false; // x satisfies a core item there
    return !belowMin(q, heldOf(q, x));
  };
  const donor = (eligible: (i: Inst) => boolean, target: IRNode) =>
    insts.find((x) => {
      const q = a.primary[x.idx];
      return !x.pin && !moved.has(x.idx) && q !== undefined && q !== target && a.replaces[x.idx] === undefined && eligible(x) && staysMet(q, x);
    });
  for (const it of unsatisfied()) {
    const x = donor((i) => forItem(i, it), it.node);
    if (x) {
      const q = a.primary[x.idx] as IRNode;
      a.primary[x.idx] = it.node;
      moved.add(x.idx);
      a.itemSat.set(it.key, { kind: 'primary', insts: [x], provisional: satisfiedVia(it, x) });
      trace({ step: '7', node: it.node.path, iid: x.iid, action: 'moved', why: `from ${q.path}, which stays met` });
      if (q.kind === 'pool' && !q.pool?.overflow && belowMin(q)) fill(q, '7');
    }
  }
  for (const p of ordered) {
    if (!p.pool?.overflow && belowMin(p)) {
      const x = donor((i) => forPool(i, p) && fitsMax(p, [i]), p);
      if (x) {
        const q = a.primary[x.idx] as IRNode;
        a.primary[x.idx] = p;
        moved.add(x.idx);
        trace({ step: '7', node: p.path, iid: x.iid, action: 'moved', why: `from ${q.path}, which stays met` });
        if (q.kind === 'pool' && !q.pool?.overflow && belowMin(q)) fill(q, '7');
      }
    }
  }

  // ---- 8. credit (counts_toward) ----
  for (const spec of tree.active.filter((x) => x.kind === 'spec' && Array.isArray(x.raw.counts_toward))) {
    const rules = (spec.raw.counts_toward as unknown[]).map((r) => {
      const path = typeof r === 'string' ? r : isObj(r) ? String(r.node) : '';
      let filter: Selector | undefined;
      try {
        filter = isObj(r) && r.courses !== undefined ? normalizeSelector(r.courses).ast : undefined;
      } catch {
        filter = undefined;
      }
      const host = resolvePath(tree, path, spec.doc).nodes.find((x) => x.kind === 'pool' && !x.inactive);
      return { host, filter };
    });
    for (const sub of spec.children.filter((c) => c.kind === 'subtree' && !c.inactive)) {
      for (const i of insts) {
        const q = a.primary[i.idx];
        if (q && within(q, sub) && !a.credits[i.idx]) {
          for (const { host, filter } of rules) {
            if (host && !a.credits[i.idx]) {
              const pool = host.pool as NonNullable<IRNode['pool']>;
              const credited = insts.filter((x) => a.credits[x.idx] === host);
              const h = heldOf(host);
              const uoc = h.uoc + credited.reduce((s, x) => s + x.uoc, 0) + i.uoc;
              const count = h.count + credited.length + 1;
              const ok =
                (!filter || matches(filter, i, spec.doc)) &&
                matches(pool.selector, i, host.doc) &&
                a.primary[i.idx] !== host &&
                !a.shares[i.idx]?.includes(host) &&
                (pool.uoc.max === undefined || uoc <= pool.uoc.max) &&
                (pool.count.max === undefined || count <= pool.count.max);
              if (ok) {
                a.credits[i.idx] = host;
                trace({ step: '8', node: host.path, iid: i.iid, action: 'credit', why: `counts_toward from ${spec.path}` });
              }
            }
          }
        }
      }
    }
  }

  // ---- 9. excess and overlap ----
  const regionOf = (x: IRNode) => {
    let cur: IRNode | undefined = x;
    while (cur && cur.kind !== 'subtree' && cur.kind !== 'component') cur = cur.parent;
    return cur;
  };
  for (const i of insts) {
    if (!i.ignored && !i.failed && (i.active || !i.completed) && a.primary[i.idx] === undefined && i.active) {
      a.notCounted.push(i);
      trace({ step: '9', node: 'root', iid: i.iid, action: 'not_counted', why: i.facts ? 'no node takes it' : 'missing from the catalogue' });
    }
  }
  for (const it of unsatisfied()) {
    if (!a.replacementMissing.has(it.key)) {
      for (const x of insts) {
        const q = a.primary[x.idx];
        if (!a.overlap.has(it.key) && q && forItem(x, it) && regionOf(q) !== regionOf(it.node) && !a.rules.some((r) => covers(r, it.node, q))) {
          a.overlap.set(it.key, { inst: x, q });
          trace({ step: '9', node: it.node.path, iid: x.iid, action: 'overlap_undeclared', why: `${x.code} counts toward ${q.path} and no share rule covers the pair` });
        }
      }
    }
  }
  // instances that could not take part: failed ones and ones missing from the catalogue
  const note = (map: Map<IRNode, Inst[]>, node: IRNode, i: Inst) => map.set(node, [...(map.get(node) ?? []), i]);
  for (const i of insts) {
    if (!i.ignored && (i.failed || !i.facts)) {
      const map = i.failed ? a.failedOn : a.missingOn;
      for (const it of coreItems.filter((x) => !x.node.inactive)) {
        if (it.alternatives.some((alt) => alt.codes.some((c) => altMatches(i, c, alt.pattern)))) note(map, it.node, i);
      }
      for (const p of pools) {
        const eligible = i.facts ? matches((p.pool as NonNullable<IRNode['pool']>).selector, i, p.doc) : selectors.names((p.pool as NonNullable<IRNode['pool']>).selector, i.code, p.doc);
        if (eligible) note(map, p, i);
      }
    }
  }
  return a;
};
