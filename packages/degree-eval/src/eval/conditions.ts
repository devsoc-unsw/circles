// Tri-state condition evaluation (SCHEMA.md §5.1–5.3).
import type { Condition, Selector } from '../lang/ast';
import { printCondition, printSelector } from '../lang/print';
import type { CoreItemIR, DocCtx, IRNode, Tree } from '../ir/tree';
import { resolvePath } from '../ir/tree';
import type { Bundle } from '../resolve/bundle';
import type { InMembership, Inst, Selectors } from './context';
import { equivalent, patternMatches } from './context';
import type { ConditionResult, Reason, ReasonCode, StudentState, Tri } from './types';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export interface World {
  bundle: Bundle;
  tree: Tree;
  insts: Inst[];
  student: StudentState;
  selectors: Selectors;
  coreItems: CoreItemIR[];
  inMember?: InMembership; // post-allocation contexts
  complete?: (node: IRNode, term: number) => Tri; // post-allocation contexts
}

// The evaluation point τ (§5.1): instances strictly before `term` are "done before".
export interface Point {
  term: number; // Infinity: the end of the plan (check, classes)
  self?: Inst; // the instance being checked (excluded from planned())
  static?: boolean; // §5.3 static contexts: only completed instances count, whatever the horizon
  doc: DocCtx; // where the condition was written (sets, node paths)
}

export const result = (status: Tri, projected = false, reasons: Reason[] = []): ConditionResult => ({
  status,
  projected,
  reasons,
  warnings: []
});

const reason = (code: ReasonCode, text: string, atom?: string, iids?: string[]): Reason => ({
  code,
  text,
  ...(atom ? { atom } : {}),
  ...(iids?.length ? { iids } : {})
});

// Kleene AND/OR (§5.2); reasons come from the operands that decided the result
export const kleeneAnd = (rs: ConditionResult[]): ConditionResult => {
  const unmet = rs.filter((r) => r.status === 'unmet');
  const unknown = rs.filter((r) => r.status === 'unknown');
  const deciding = unmet.length ? unmet : unknown.length ? unknown : rs;
  return {
    status: unmet.length ? 'unmet' : unknown.length ? 'unknown' : 'met',
    projected: deciding.some((r) => r.projected),
    reasons: deciding.flatMap((r) => r.reasons),
    warnings: rs.flatMap((r) => r.warnings)
  };
};

const kleeneOr = (rs: ConditionResult[]): ConditionResult => {
  const met = rs.filter((r) => r.status === 'met');
  const unknown = rs.filter((r) => r.status === 'unknown');
  const deciding = met.length ? met.slice(0, 1) : unknown.length ? unknown : rs;
  return {
    status: met.length ? 'met' : unknown.length ? 'unknown' : 'unmet',
    projected: deciding.some((r) => r.projected),
    reasons: deciding.flatMap((r) => r.reasons),
    warnings: rs.flatMap((r) => r.warnings)
  };
};

export class Conditions {
  constructor(private readonly w: World) {}

  private get horizon() {
    return this.w.student.horizon ?? 'planned';
  }

  // done at τ: passed (or pending, or planned under the planned horizon) and not ignored (§5.1 Results)
  private done(i: Inst, p: Point): boolean {
    if (i.ignored || i.failed) return false;
    if (p.static) return i.completed && i.outcome !== 'pending';
    return i.completed || this.horizon === 'planned';
  }

  private isEquiv(a: string, b: string, i: Inst) {
    return equivalent(this.w.bundle, a, b, i.year);
  }

  private sel(s: Selector, i: Inst, p: Point): boolean {
    return this.w.selectors.matches(s, { code: i.code, ...(i.facts ? { facts: i.facts } : {}), inst: i }, p.doc, this.w.inMember);
  }

  evaluate(c: Condition, p: Point): ConditionResult {
    if (typeof c === 'boolean') return result(c ? 'met' : 'unmet');
    if (typeof c === 'string') return this.course(c, p, false);
    if ('and' in c) return kleeneAnd(c.and.map((x) => this.evaluate(x, p)));
    if ('or' in c) return kleeneOr(c.or.map((x) => this.evaluate(x, p)));
    if ('not' in c) {
      const r = this.evaluate(c.not, p);
      const flip: Record<Tri, Tri> = { met: 'unmet', unmet: 'met', unknown: 'unknown' };
      return { ...r, status: flip[r.status] };
    }
    if ('coreq' in c) return this.course(c.coreq, p, true);
    if ('planned' in c) return this.planned(c.planned, p);
    if ('uoc' in c) return this.uoc(c.uoc.min, c.uoc.in, p, printCondition(c));
    if ('wam' in c) return this.wam(c.wam.min, c.wam.in, p, printCondition(c));
    if ('grade' in c) return this.grade(c, p);
    if ('reported_wam' in c) {
      const v = this.w.student.reported?.[c.reported_wam.label];
      const atom = printCondition(c);
      if (v === undefined) return result('unknown', false, [reason('not_attested', `${c.reported_wam.label} has not been entered`, atom)]);
      return result(v >= c.reported_wam.min ? 'met' : 'unmet', false, v >= c.reported_wam.min ? [] : [reason('below_min', `${c.reported_wam.label} is ${v}, below ${c.reported_wam.min}`, atom)]);
    }
    if ('cores' in c) return this.cores(c.cores === true ? undefined : c.cores, p, printCondition(c));
    if ('complete' in c) return this.complete(c.complete, p, printCondition(c));
    if ('program' in c) return this.program(c.program, p, printCondition(c));
    if ('spec' in c) return this.spec(c.spec, p, printCondition(c));
    const key = typeof c.manual === 'string' ? c.manual : c.manual.id;
    const text = typeof c.manual === 'string' ? c.manual : c.manual.text;
    if (this.w.student.attest?.[key]) return result('met');
    return result('unknown', false, [reason('manual', `needs confirmation: ${text}`, printCondition(c))]);
  }

  // X (done before t) or coreq(X) (done in or before t), counting equivalents (§5.1)
  private course(code: string, p: Point, coreq: boolean): ConditionResult {
    const hits = this.w.insts.filter(
      (i) =>
        i !== p.self &&
        this.done(i, p) &&
        (coreq ? i.term <= p.term : i.term < p.term) &&
        this.isEquiv(i.code, code, i)
    );
    if (hits.length) return result('met', hits.every((i) => i.projected));
    const atom = coreq ? `coreq(${code})` : code;
    return result('unmet', false, [reason('requires_unmet', `${code} is not completed${coreq ? ' by then' : ' before this term'}`, atom)]);
  }

  // planned(X): an instance of X or an equivalent anywhere in the plan other than i, not failed,
  // withdrawn or ignored (§5.1)
  private planned(code: string, p: Point): ConditionResult {
    const hits = this.w.insts.filter(
      (i) => i !== p.self && !i.ignored && !i.failed && this.isEquiv(i.code, code, i)
    );
    if (hits.length) {
      return result('met', hits.every((i) => i.projected), [
        reason('excluded', `${code} is in the plan`, `planned(${code})`, hits.map((i) => i.iid))
      ]);
    }
    return result('unmet');
  }

  private uoc(min: number, s: Selector | undefined, p: Point, atom: string): ConditionResult {
    const done = this.w.insts.filter((i) => this.done(i, p) && i.term < p.term && (s === undefined || this.sel(s, i, p)));
    const known = done.filter((i) => i.facts);
    const sum = known.reduce((a, i) => a + i.uoc, 0);
    if (sum >= min) {
      // projected unless the completed instances alone reach it
      const firm = known.filter((i) => !i.projected).reduce((a, i) => a + i.uoc, 0);
      return result('met', firm < min);
    }
    if (done.some((i) => !i.facts)) {
      return result('unknown', false, [reason('catalogue_missing', `UOC of ${done.filter((i) => !i.facts).map((i) => i.code).join(', ')} unknown`, atom)]);
    }
    return result('unmet', false, [reason('below_min', `${sum} UOC${s === undefined ? '' : ` in ${printSelector(s)}`} completed, ${min} needed`, atom)]);
  }

  // WAM = Σ mark·uoc / Σ uoc over WAM-bearing instances with a mark; exact arithmetic (§5.1)
  private wam(min: number, s: Selector | undefined, p: Point, atom: string): ConditionResult {
    const relevant = this.w.insts.filter(
      (i) => !i.ignored && i.term < p.term && i.uoc > 0 && (s === undefined || this.sel(s, i, p))
    );
    const bearing = relevant.filter(
      (i) => i.completed && (i.outcome === 'pass' || i.outcome === 'fail') && i.mark !== undefined
    );
    const projected = relevant.some((i) => !p.static && (!i.completed || i.outcome === 'pending'));
    if (relevant.some((i) => i.completed && i.outcome === 'pass' && i.mark === undefined) || !bearing.length) {
      return result('unknown', projected, [reason('missing_mark', 'no mark to compute the WAM from', atom)]);
    }
    const scaled = (x: number) => Math.round(x * 100);
    const num = bearing.reduce((a, i) => a + scaled(i.mark ?? 0) * i.uoc, 0);
    const den = bearing.reduce((a, i) => a + i.uoc, 0);
    const ok = num >= scaled(min) * den;
    return result(ok ? 'met' : 'unmet', projected, ok ? [] : [reason('below_min', `WAM ${(num / den / 100).toFixed(2)} is below ${min}`, atom)]);
  }

  private grade(c: Extract<Condition, { grade: unknown }>, p: Point): ConditionResult {
    const g = c.grade;
    const atom = printCondition(c);
    const match = (i: Inst) => ('course' in g ? this.isEquiv(i.code, g.course, i) : this.sel(g.in, i, p));
    const done = this.w.insts.filter((i) => this.done(i, p) && i.term < p.term && match(i));
    const marked = done.filter((i) => i.completed && i.mark !== undefined);
    if (marked.some((i) => (i.mark ?? 0) >= g.min)) return result('met');
    const unmarked = done.filter((i) => !i.completed || i.mark === undefined);
    if (unmarked.length) {
      return result('unknown', true, [reason('missing_mark', `no mark yet for ${unmarked.map((i) => i.code).join(', ')}`, atom, unmarked.map((i) => i.iid))]);
    }
    return result('unmet', false, [reason('below_min', done.length ? `best mark is below ${g.min}` : 'no matching course completed', atom)]);
  }

  // cores(sel): every core item with an alternative matching sel is satisfied by done instances
  private cores(s: Selector | undefined, p: Point, atom: string): ConditionResult {
    const items = this.w.coreItems.filter(
      (it) =>
        it.node.raw.is_core !== false &&
        !it.node.inactive &&
        it.alternatives.some((alt) =>
          alt.codes.some((code) => s === undefined || this.w.selectors.matches(s, { code, ...(this.w.bundle.facts(code, p.doc.year) ? { facts: this.w.bundle.facts(code, p.doc.year) as NonNullable<ReturnType<Bundle['facts']>> } : {}) }, it.node.doc))
        )
    );
    if (!items.length) return result('unknown', false, [reason('no_matching_cores', 'no core item matches', atom)]);
    const rs = items.map((it) => {
      if (it.exempt) return result('met');
      const sats = it.alternatives.map((alt) => {
        const insts = alt.codes.map((code) =>
          this.w.insts.find((i) => this.done(i, p) && i.term < p.term && (alt.pattern ? patternMatches(code, i.code) : this.isEquiv(i.code, code, i)))
        );
        return insts.every(Boolean) ? (insts as Inst[]) : undefined;
      });
      const best = sats.find((x) => x && x.every((i) => !i.projected)) ?? sats.find(Boolean);
      return best
        ? result('met', best.some((i) => i.projected))
        : result('unmet', false, [reason('not_planned', `core item ${it.written} not completed`, atom)]);
    });
    return kleeneAnd(rs);
  }

  private complete(path: string, p: Point, atom: string): ConditionResult {
    if (!this.w.complete) return result('unknown', false, [reason('unresolved_path', 'complete() is only evaluated after allocation', atom)]);
    const { nodes, unresolved } = resolvePath(this.w.tree, path, p.doc);
    if (unresolved || !nodes.length) return result('unknown', false, [reason('unresolved_path', `${path} does not resolve`, atom)]);
    return kleeneAnd(nodes.map((n) => {
      const s = (this.w.complete as (node: IRNode, term: number) => Tri)(n, p.term);
      return result(s, false, s === 'met' ? [] : [reason(s === 'unmet' ? 'below_min' : 'unresolved_path', `${path} is not complete`, atom)]);
    }));
  }

  private groups(kind: 'program_groups' | 'spec_groups', name: string, p: Point): string[] {
    const lib = this.w.bundle.library(p.doc.year);
    const g = isObj(lib?.[kind]) ? (lib[kind] as Obj)[name] : undefined;
    return Array.isArray(g) ? g.map(String) : [];
  }

  private program(list: string[], p: Point, atom: string): ConditionResult {
    const mine = [this.w.tree.program.code, ...(Array.isArray(this.w.tree.program.data.components) ? this.w.tree.program.data.components : []).filter(isObj).map((c) => String(c.program))];
    const codes = list.flatMap((x) => (x.startsWith('@') ? this.groups('program_groups', x.slice(1), p) : [x]));
    const ok = mine.some((m) => codes.includes(m));
    return result(ok ? 'met' : 'unmet', false, ok ? [] : [reason('not_allowed', `program ${mine.join('/')} is not ${list.join(', ')}`, atom)]);
  }

  private spec(list: string[], p: Point, atom: string): ConditionResult {
    const selected = [...this.w.tree.nodes.values()].filter((n) => n.kind === 'subtree' && !n.inactive).map((n) => n.id);
    const patterns = list.flatMap((x) => (x.startsWith('@') ? this.groups('spec_groups', x.slice(1), p) : [x]));
    const ok = selected.some((code) => patterns.some((pat) => patternMatches(pat, code)));
    return result(ok ? 'met' : 'unmet', false, ok ? [] : [reason('not_allowed', `no selected specialisation matches ${list.join(', ')}`, atom)]);
  }
}
