// Node status (SCHEMA.md §7.6): per-kind rules, the uoc check with blocked UOC, Kleene AND for
// structural nodes.
import type { CoreItemIR, IRNode, Tree } from '../ir/tree';
import { resolvePath, toRange, within } from '../ir/tree';
import type { Condition, Selector } from '../lang/ast';
import { normalizeCondition, normalizeSelector } from '../lang/normalize';
import type { Allocation } from './allocate';
import type { Conditions, World } from './conditions';
import { kleeneAnd, result } from './conditions';
import type { Inst } from './context';
import { equivalent, patternMatches } from './context';
import type { ConditionResult, NodeResult, Reason, ReasonCode, UocRange } from './types';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

const reason = (code: ReasonCode, text: string, iids?: string[]): Reason => ({
  code,
  text,
  ...(iids?.length ? { iids } : {})
});

const dedupe = (rs: Reason[]): Reason[] => {
  const seen = new Set<string>();
  return rs.filter((r) => {
    const k = `${r.code}|${r.text}`;
    return !seen.has(k) && seen.add(k);
  });
};

const conditionCache = new Map<string, Condition | null>();
export const conditionOf = (v: unknown): Condition | undefined => {
  const key = JSON.stringify(v);
  if (!conditionCache.has(key)) {
    try {
      conditionCache.set(key, normalizeCondition(v, { lenient: true }).ast);
    } catch {
      conditionCache.set(key, null);
    }
  }
  return conditionCache.get(key) ?? undefined;
};
const selectorOf = (v: unknown): Selector | undefined => {
  try {
    return normalizeSelector(v).ast;
  } catch {
    return undefined;
  }
};

export interface Statuses {
  results: Map<string, NodeResult>; // active nodes by path
  rootUocFails: boolean; // §7.5 criterion 1 adds 1 when the root total fails
}

export const computeStatuses = (
  w: World,
  conds: Conditions,
  tree: Tree,
  alloc: Allocation,
  insts: Inst[],
  rootUoc: UocRange
): Statuses => {
  const results = new Map<string, NodeResult>();
  const horizon = w.student.horizon ?? 'planned';

  // counted (primary, replacement, share) and credited instances per node, including subtrees
  const counted = new Map<IRNode, Set<Inst>>();
  const add = (map: Map<IRNode, Set<Inst>>, n: IRNode, i: Inst) => {
    for (let cur: IRNode | undefined = n; cur; cur = cur.parent) {
      if (!map.has(cur)) map.set(cur, new Set());
      map.get(cur)?.add(i);
    }
  };
  for (const i of insts) {
    const p = alloc.primary[i.idx];
    if (p) add(counted, p, i);
    for (const s of alloc.shares[i.idx] ?? []) add(counted, s, i);
  }
  const countedIn = (n: IRNode) => [...(counted.get(n) ?? [])];
  const uocOf = (xs: Iterable<Inst>) => [...xs].reduce((s, i) => s + i.uoc, 0);

  // blocked instances per structural node (§7.6): overlap_undeclared and catalogue_missing
  const blocked = new Map<IRNode, Set<Inst>>();
  const missingIn = new Set<IRNode>();
  for (const [key, { inst, q }] of alloc.overlap) {
    const item = w.coreItems.find((it) => it.key === key);
    for (let cur = item?.node; cur; cur = cur.parent) {
      if (!within(q, cur) && !counted.get(cur)?.has(inst)) {
        if (!blocked.has(cur)) blocked.set(cur, new Set());
        blocked.get(cur)?.add(inst);
      }
    }
  }
  for (const node of alloc.missingOn.keys())
    for (let cur: IRNode | undefined = node; cur; cur = cur.parent) missingIn.add(cur);

  const allocations = (n: IRNode) =>
    insts.flatMap((i) => {
      const out: NodeResult['allocations'] = [];
      if (alloc.primary[i.idx] === n)
        out.push({ iid: i.iid, kind: alloc.replaces[i.idx] ? 'replacement' : 'primary' });
      if (alloc.shares[i.idx]?.includes(n)) out.push({ iid: i.iid, kind: 'share' });
      if (alloc.credits[i.idx] === n) out.push({ iid: i.iid, kind: 'credit' });
      return out;
    });

  const uocCheck = (
    n: IRNode,
    range: UocRange | undefined,
    label: string
  ): ConditionResult | undefined => {
    if (!range || (range.min === undefined && range.max === undefined)) return undefined;
    const c = uocOf(countedIn(n));
    if (range.max !== undefined && c > range.max) {
      return result('unmet', false, [
        reason('above_max', `${label}: ${c} UOC counted, at most ${range.max}`)
      ]);
    }
    if (c >= (range.min ?? 0)) return result('met');
    const b = [...(blocked.get(n) ?? [])];
    if (missingIn.has(n) || c + uocOf(b) >= (range.min ?? 0)) {
      const codes: Reason[] = [];
      if (b.length)
        codes.push(
          reason(
            'overlap_undeclared',
            `${label}: ${c} UOC counted + ${uocOf(b)} UOC blocked by an undeclared overlap, ${range.min ?? 0} needed`,
            b.map((i) => i.iid)
          )
        );
      if (missingIn.has(n))
        codes.push(
          reason(
            'catalogue_missing',
            `${label}: a course's UOC is unknown (missing from the catalogue)`
          )
        );
      return result('unknown', false, codes);
    }
    return result('unmet', false, [
      reason('below_min', `${label}: ${c} UOC counted, ${range.min ?? 0} needed`)
    ]);
  };

  const itemCovers = (it: CoreItemIR, i: Inst) =>
    it.alternatives.some((alt) =>
      alt.codes.some((c) =>
        alt.pattern ? patternMatches(c, i.code) : equivalent(w.bundle, i.code, c, i.year)
      )
    );

  const coreStatus = (n: IRNode): ConditionResult => {
    const rs = w.coreItems
      .filter((it) => it.node === n)
      .map((it): ConditionResult => {
        if (it.exempt) {
          return it.exempt.provisional
            ? result('unknown', false, [
                reason('provisional', `${it.written} exempt provisionally`)
              ])
            : result('met');
        }
        const sat = alloc.itemSat.get(it.key);
        if (sat) {
          const projected = sat.insts.some((i) => i.projected);
          return sat.provisional
            ? result('unknown', projected, [
                reason('provisional', `${it.written} met only through a provisional substitution`)
              ])
            : result('met', projected);
        }
        if (alloc.replacementMissing.has(it.key)) {
          return result('unmet', false, [
            reason(
              'replacement_missing',
              `${it.written} counts elsewhere; plan a replacement elective`
            )
          ]);
        }
        const ov = alloc.overlap.get(it.key);
        if (ov) {
          return result('unknown', ov.inst.projected, [
            reason(
              'overlap_undeclared',
              `${it.written}: ${ov.inst.code} counts toward ${ov.q.path}; no share rule says whether it may count here too`,
              [ov.inst.iid]
            )
          ]);
        }
        const missing = (alloc.missingOn.get(n) ?? []).filter((i) => itemCovers(it, i));
        if (missing.length) {
          return result('unknown', false, [
            reason(
              'catalogue_missing',
              `${it.written}: ${missing.map((i) => i.code).join(', ')} missing from the catalogue`,
              missing.map((i) => i.iid)
            )
          ]);
        }
        const failed = (alloc.failedOn.get(n) ?? []).filter((i) => itemCovers(it, i));
        return result('unmet', false, [
          reason('not_planned', `${it.written} is not planned`),
          ...(failed.length
            ? [
                reason(
                  'failed',
                  `${failed.map((i) => i.code).join(', ')} failed`,
                  failed.map((i) => i.iid)
                )
              ]
            : [])
        ]);
      });
    return kleeneAnd(rs.length ? rs : [result('met')]);
  };

  const poolStatus = (n: IRNode): ConditionResult => {
    const pool = n.pool as NonNullable<IRNode['pool']>;
    const own = insts.filter((i) => alloc.primary[i.idx] === n || alloc.shares[i.idx]?.includes(n));
    const credited = insts.filter((i) => alloc.credits[i.idx] === n);
    const uoc = uocOf(own) + uocOf(credited);
    const count = own.length + credited.length;
    const short: string[] = [];
    if (uoc < (pool.uoc.min ?? 0)) short.push(`${uoc} of ${pool.uoc.min ?? 0} UOC`);
    if (count < (pool.count.min ?? 0)) short.push(`${count} of ${pool.count.min ?? 0} courses`);
    pool.quotas.forEach((q, k) => {
      const qs = own.filter((i) =>
        w.selectors.matches(
          q.selector,
          { code: i.code, ...(i.facts ? { facts: i.facts } : {}), inst: i },
          n.doc
        )
      );
      if (uocOf(qs) < (q.uoc.min ?? 0))
        short.push(`quota ${k + 1}: ${uocOf(qs)} of ${q.uoc.min ?? 0} UOC`);
      if (qs.length < (q.count.min ?? 0))
        short.push(`quota ${k + 1}: ${qs.length} of ${q.count.min ?? 0} courses`);
    });
    const projected = [...own, ...credited].some((i) => i.projected);
    if (!short.length) return result('met', projected);
    if (alloc.poolOverflow.has(n))
      return result('unknown', projected, [
        reason('below_min', 'too many candidate combinations to search exactly')
      ]);
    const missing = alloc.missingOn.get(n) ?? [];
    if (missing.length) {
      return result('unknown', projected, [
        reason(
          'catalogue_missing',
          `${missing.map((i) => i.code).join(', ')} missing from the catalogue`,
          missing.map((i) => i.iid)
        )
      ]);
    }
    const failed = alloc.failedOn.get(n) ?? [];
    return result('unmet', projected, [
      reason('below_min', short.join('; ')),
      ...(failed.length
        ? [
            reason(
              'failed',
              `${failed.map((i) => i.code).join(', ')} failed`,
              failed.map((i) => i.iid)
            )
          ]
        : [])
    ]);
  };

  const { inMember } = w;
  const instCourse = (i: Inst) => ({
    code: i.code,
    ...(i.facts ? { facts: i.facts } : {}),
    inst: i
  });
  const takesPart = (i: Inst) => !i.ignored && !i.failed && (i.completed || horizon === 'planned');

  const limitStatus = (n: IRNode): { r: ConditionResult; sum: number; inactive: boolean } => {
    const scopePath = typeof n.raw.scope === 'string' ? n.raw.scope : 'root';
    const { nodes, unresolved } = resolvePath(tree, scopePath, n.doc);
    if (unresolved)
      return {
        r: result('unknown', false, [
          reason('unresolved_path', `scope ${scopePath} does not resolve`)
        ]),
        sum: 0,
        inactive: false
      };
    const inactive =
      !nodes.length ||
      nodes.some((s) => s.inactive || (s.kind === 'spec' && !(s.selected ?? []).length));
    if (inactive)
      return {
        r: result('met', false, [
          reason('inactive', `scope ${scopePath} has no selected specialisation or branch`)
        ]),
        sum: 0,
        inactive: true
      };
    const from = selectorOf(n.raw.from);
    const match = (i: Inst) =>
      from !== undefined && w.selectors.matches(from, instCourse(i), n.doc, inMember);
    const pool =
      n.raw.basis === 'planned'
        ? insts.filter((i) => takesPart(i) && match(i))
        : [...new Set(nodes.flatMap((s) => countedIn(s)))].filter(match);
    const sum = uocOf(pool);
    const range = toRange(n.raw.uoc);
    const projected = pool.some((i) => i.projected);
    if (range.max !== undefined && sum > range.max)
      return {
        r: result('unmet', projected, [reason('above_max', `${sum} UOC, at most ${range.max}`)]),
        sum,
        inactive
      };
    if (sum < (range.min ?? 0))
      return {
        r: result('unmet', projected, [
          reason('below_min', `${sum} UOC, at least ${range.min ?? 0} needed`)
        ]),
        sum,
        inactive
      };
    return { r: result('met', projected), sum, inactive };
  };

  const maturityStatus = (n: IRNode): ConditionResult => {
    const applies = selectorOf(n.raw.applies_to);
    const cond = conditionOf(n.raw.require);
    if (!applies || !cond) return result('unknown');
    const rs = insts
      .filter((i) => takesPart(i) && w.selectors.matches(applies, instCourse(i), n.doc, inMember))
      .map((i) => {
        const r = conds.evaluate(cond, { term: i.term, self: i, doc: n.doc });
        return {
          ...r,
          reasons: r.reasons.map((x) => ({
            ...x,
            iids: [i.iid],
            text: `${i.code} (term ${i.term}): ${x.text}`
          }))
        };
      });
    return kleeneAnd(rs.length ? rs : [result('met')]);
  };

  const enclosingTotal = (n: IRNode): number => {
    for (let cur = n.parent; cur; cur = cur.parent) {
      if (cur.kind === 'component') return cur.uoc?.min ?? 0;
    }
    return rootUoc.min ?? 0;
  };

  const timingStatus = (n: IRNode): ConditionResult => {
    const sel = selectorOf(n.raw.courses);
    if (!sel) return result('unknown');
    const matching = insts.filter(
      (i) => takesPart(i) && w.selectors.matches(sel, instCourse(i), n.doc, inMember)
    );
    if (!matching.length) return result('met');
    const terms = insts.filter((i) => !i.ignored).map((i) => i.term);
    const fail = (text: string) =>
      result(
        'unmet',
        matching.some((i) => i.projected),
        [
          reason(
            'below_min',
            text,
            matching.map((i) => i.iid)
          )
        ]
      );
    if (typeof n.raw.within_final_uoc === 'number') {
      const total = enclosingTotal(n);
      for (const i of matching) {
        const before = uocOf(insts.filter((x) => takesPart(x) && x.term < i.term));
        if (before < total - n.raw.within_final_uoc) {
          return fail(
            `${i.code} is taken with ${total - before} UOC remaining (must be within the final ${n.raw.within_final_uoc} UOC)`
          );
        }
      }
    }
    if (n.raw.term === 'first' && matching.some((i) => i.term !== Math.min(...terms)))
      return fail('must be taken in the first term of the plan');
    if (n.raw.term === 'last' && matching.some((i) => i.term !== Math.max(...terms)))
      return fail('must be taken in the last term of the plan');
    if (n.raw.same_term === true && new Set(matching.map((i) => i.term)).size > 1)
      return fail('must all be taken in the same term');
    if (n.raw.consecutive === true) {
      // consecutive standard terms: only summer terms may lie between two of them (§4.2)
      const summer = new Set(w.student.summerTerms ?? []);
      const ts = [...new Set(matching.map((i) => i.term))].sort((x, y) => x - y);
      const gap = (from: number, to: number) => {
        for (let t = from + 1; t < to; t++) if (!summer.has(t)) return true;
        return false;
      };
      if (ts.some((t, k) => k > 0 && gap(ts[k - 1] ?? t, t)))
        return fail('must be taken in consecutive terms');
    }
    if (Array.isArray(n.raw.order)) {
      const firsts = (n.raw.order as unknown[])
        .map(String)
        .map(
          (code) =>
            matching
              .filter((i) => i.code === code)
              .map((i) => i.term)
              .sort((x, y) => x - y)[0]
        )
        .filter((t): t is number => t !== undefined);
      if (firsts.some((t, k) => k > 0 && t <= (firsts[k - 1] ?? t)))
        return fail(`must be taken in the order ${(n.raw.order as unknown[]).join(', ')}`);
    }
    return result(
      'met',
      matching.some((i) => i.projected)
    );
  };

  const specExtras = (n: IRNode): ConditionResult[] => {
    const out: ConditionResult[] = [];
    const selected = n.selected ?? [];
    const count = n.count ?? { min: 1, max: 1 };
    if (selected.length < (count.min ?? 0)) {
      out.push(
        result('unmet', false, [
          reason(
            selected.length ? 'below_min' : 'select_spec',
            selected.length ? `select at least ${count.min ?? 0}` : 'select a specialisation'
          )
        ])
      );
    } else if (count.max !== undefined && selected.length > count.max) {
      out.push(result('unmet', false, [reason('above_max', `select at most ${count.max}`)]));
    }
    const subtrees = n.children.filter((c) => c.kind === 'subtree');
    const keyOf = (by: unknown, sub: IRNode) =>
      by === 'title' ? String(sub.raw.title) : by === 'subject' ? sub.id.slice(0, 4) : sub.id;
    for (const rule of (Array.isArray(n.raw.distinct_from) ? n.raw.distinct_from : []).filter(
      isObj
    )) {
      const other = resolvePath(tree, String(rule.node), n.doc).nodes.find(
        (x) => x.kind === 'spec'
      );
      const theirs = (other?.children ?? [])
        .filter((c) => c.kind === 'subtree')
        .map((c) => keyOf(rule.by, c));
      const clash = subtrees.find((s) => theirs.includes(keyOf(rule.by, s)));
      if (clash)
        out.push(
          result('unmet', false, [
            reason(
              'distinct_violation',
              `${clash.id} has the same ${typeof rule.by === 'string' ? rule.by : 'code'} as a selection in ${String(rule.node)}`
            )
          ])
        );
    }
    for (const sub of subtrees) {
      const allowed =
        sub.raw.allowed_if === undefined ? undefined : conditionOf(sub.raw.allowed_if);
      if (allowed !== undefined) {
        const r = conds.evaluate(allowed, { term: Infinity, static: true, doc: sub.doc });
        if (r.status === 'unmet')
          out.push(
            result('unmet', false, [
              reason(
                'not_allowed',
                `${sub.id} is not available: ${r.reasons.map((x) => x.text).join('; ') || 'allowed_if is unmet'}`
              )
            ])
          );
        if (r.status === 'unknown')
          out.push(
            result('unknown', false, [
              reason('provisional', `${sub.id} is allowed only provisionally`)
            ])
          );
      }
    }
    return out;
  };

  const visit = (n: IRNode): NodeResult => {
    const kids = n.children.filter((c) => !c.inactive).map(visit);
    let r: ConditionResult;
    let sum: number | undefined;
    let inactive = false;
    const warnings: Reason[] = [];
    const childResults = () => {
      const rs: ConditionResult[] = [];
      for (const k of kids) {
        const node = tree.nodes.get(k.path) as IRNode;
        if (!k.inactive) {
          if (node.severity === 'warning' && k.status !== 'met') {
            warnings.push(...k.reasons.map((x) => ({ ...x, text: `${k.path}: ${x.text}` })));
            rs.push(result('met', k.projected));
          } else rs.push(result(k.status, k.projected, k.reasons));
        }
      }
      return rs;
    };
    switch (n.kind) {
      case 'core':
        r = coreStatus(n);
        break;
      case 'pool':
        r = poolStatus(n);
        break;
      case 'limit': {
        const l = limitStatus(n);
        ({ r, sum, inactive } = l);
        break;
      }
      case 'maturity':
        r = maturityStatus(n);
        break;
      case 'timing':
        r = timingStatus(n);
        break;
      case 'check': {
        const cond = conditionOf(n.raw.require);
        r = cond ? conds.evaluate(cond, { term: Infinity, doc: n.doc }) : result('unknown');
        break;
      }
      case 'info':
        if (n.raw.confirm === true) {
          r = w.student.attest?.[n.id]
            ? result('met')
            : result('unknown', false, [
                reason('not_attested', `needs confirmation: ${String(n.raw.text)}`)
              ]);
        } else {
          r = result('met');
          inactive = true; // display only: excluded from the parent's status (§4.2)
        }
        break;
      case 'spec':
        r = kleeneAnd([...specExtras(n), ...childResults()]);
        break;
      default: {
        // root, component, group, subtree
        const parts = childResults();
        if (n.choose) {
          const chosen = n.chosen ?? [];
          if (
            chosen.length < (n.choose.min ?? 0) ||
            (n.choose.max !== undefined && chosen.length > n.choose.max)
          ) {
            parts.push(
              result('unmet', false, [
                reason(
                  'not_selected',
                  `choose ${n.choose.min ?? 0}–${n.choose.max ?? '∞'} of these`
                )
              ])
            );
          }
        }
        const label =
          n.kind === 'root'
            ? 'program total'
            : n.kind === 'subtree'
              ? `${n.id} total`
              : `${n.id} total`;
        const range =
          n.kind === 'root' ? rootUoc : n.kind === 'subtree' ? (n.parent?.uoc ?? n.uoc) : n.uoc;
        const check = uocCheck(n, range, label);
        if (check) parts.push(check);
        r = kleeneAnd(parts.length ? parts : [result('met')]);
      }
    }
    const own = countedIn(n);
    const credited = insts.filter((i) => alloc.credits[i.idx] === n);
    const projected =
      r.projected ||
      (n.kind !== 'limit' && n.kind !== 'info' && own.some((i) => i.projected)) ||
      kids.some((k) => k.projected && !k.inactive);
    const required =
      n.kind === 'root'
        ? rootUoc
        : n.kind === 'subtree'
          ? (n.parent?.uoc ?? n.uoc)
          : n.kind === 'pool'
            ? n.pool?.uoc
            : n.kind === 'limit'
              ? toRange(n.raw.uoc)
              : n.uoc;
    const res: NodeResult = {
      path: n.path,
      id: n.id,
      kind: n.kind,
      ...(typeof n.raw.title === 'string' ? { title: n.raw.title } : {}),
      ...(typeof n.raw.role === 'string' ? { role: n.raw.role } : {}),
      ...(n.items ? { items: n.items.map((i) => i.written) } : {}),
      ...(n.kind === 'info' && typeof n.raw.text === 'string' ? { text: n.raw.text } : {}),
      status: r.status,
      projected,
      counted_uoc:
        sum ??
        (n.kind === 'info' || n.kind === 'maturity' || n.kind === 'timing' || n.kind === 'check'
          ? 0
          : uocOf(own)),
      credited_uoc: uocOf(credited),
      ...(required && (required.min !== undefined || required.max !== undefined)
        ? { required_uoc: required }
        : {}),
      allocations: allocations(n),
      reasons: dedupe(r.reasons),
      warnings: dedupe([...r.warnings, ...warnings]),
      ...(inactive ? { inactive } : {}),
      ...(n.kind === 'spec' ? { selected: n.selected ?? [] } : {}),
      ...(n.choose ? { selected: n.chosen ?? [] } : {}),
      ...(n.autoSelected ? { autoSelected: n.chosen ?? [] } : {}),
      children: n.children.filter((c) => !c.inactive).map((c) => c.path)
    };
    results.set(n.path, res);
    return res;
  };
  const root = visit(tree.root);
  const rootCheck = uocCheck(tree.root, rootUoc, 'program total');
  return {
    results: new Map([...results.entries()].map(([k, v]) => [k, k === tree.root.path ? root : v])),
    rootUocFails: rootCheck !== undefined && rootCheck.status !== 'met'
  };
};
