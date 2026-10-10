// Plan instances, course equivalence and selector matching (SCHEMA.md §5.1, §6, §7.1, §7.3).
import type { DocCtx } from '../ir/tree';
import type { Selector } from '../lang/ast';
import { normalizeSelector } from '../lang/normalize';
import type { Bundle } from '../resolve/bundle';
import type { CourseFacts, Outcome, PlanInstance, StudentState } from './types';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export interface Inst {
  idx: number; // canonical index: (term, code, iid) order (§7.4)
  iid: string;
  code: string;
  term: number;
  year: number;
  completed: boolean;
  outcome?: Outcome;
  mark?: number;
  facts?: CourseFacts; // undefined: missing from the catalogue (§7.3)
  uoc: number; // 0 when the catalogue entry is missing (see `facts`)
  ignored: boolean;
  failed: boolean; // fail or withdrawn
  projected: boolean; // planned, or completed with a pending result
  active: boolean; // takes part in allocation (§7.3)
  pin?: string;
}

export const makeInstances = (bundle: Bundle, student: StudentState): Inst[] => {
  const horizon = student.horizon ?? 'planned';
  const ignored = new Set(student.ignored ?? []);
  const sorted = [...student.plan].sort(
    (a: PlanInstance, b: PlanInstance) =>
      a.term - b.term ||
      (a.code < b.code ? -1 : a.code > b.code ? 1 : 0) ||
      (a.iid < b.iid ? -1 : a.iid > b.iid ? 1 : 0)
  );
  return sorted.map((p, idx) => {
    const year = p.year ?? student.year;
    const facts = bundle.facts(p.code, year);
    const completed = p.status === 'completed';
    const failed = completed && (p.outcome === 'fail' || p.outcome === 'withdrawn');
    const isIgnored = ignored.has(p.iid);
    const pin = student.pins?.[p.iid];
    return {
      idx,
      iid: p.iid,
      code: p.code,
      term: p.term,
      year,
      completed,
      ...(p.outcome ? { outcome: p.outcome } : {}),
      ...(p.mark === undefined ? {} : { mark: p.mark }),
      ...(facts ? { facts } : {}),
      uoc: facts?.uoc ?? 0,
      ignored: isIgnored,
      failed,
      projected: !completed || p.outcome === 'pending',
      active: !isIgnored && !failed && (completed || horizon === 'planned'),
      ...(pin ? { pin } : {})
    };
  });
};

// X and its catalogue equivalents (in either direction), in year `year`
export const equivalent = (bundle: Bundle, a: string, b: string, year: number): boolean => {
  if (a === b) return true;
  return (
    (bundle.facts(a, year)?.equivalents ?? []).includes(b) ||
    (bundle.facts(b, year)?.equivalents ?? []).includes(a)
  );
};

// `*` matches one character (§6.1); patterns are the same length as codes
export const patternMatches = (pattern: string, code: string): boolean =>
  pattern.length === code.length && [...pattern].every((ch, i) => ch === '*' || ch === code[i]);

export interface Course {
  code: string;
  facts?: CourseFacts;
  inst?: Inst; // present for plan instances: needed by `in:`
}

// `in:path` membership: is the instance allocated (primary, replacement or share) inside a node the
// path denotes? Undefined in pre-allocation contexts, where `in:` matches nothing.
export type InMembership = (inst: Inst, path: string, doc: DocCtx) => boolean;

export class Selectors {
  private readonly sets = new Map<string, Selector | null>();

  constructor(private readonly bundle: Bundle) {}

  // a named set: the document's local sets, then the library for the document's year (§6.4)
  set(name: string, doc: DocCtx): Selector | undefined {
    const key = `${doc.key}@${name}`;
    if (!this.sets.has(key)) {
      const local = isObj(doc.data.sets) ? doc.data.sets[name] : undefined;
      const lib = this.bundle.library(doc.year);
      const raw = local ?? (isObj(lib?.sets) ? lib.sets[name] : undefined);
      this.sets.set(key, null); // cycle guard while normalising
      let sel: Selector | null;
      try {
        sel = raw === undefined ? null : normalizeSelector(raw).ast;
      } catch {
        sel = null;
      }
      this.sets.set(key, sel);
    }
    return this.sets.get(key) ?? undefined;
  }

  matches(sel: Selector, c: Course, doc: DocCtx, inMember?: InMembership, depth = 0): boolean {
    if (depth > 50) return false;
    const m = (s: Selector) => this.matches(s, c, doc, inMember, depth + 1);
    if (typeof sel === 'string') return sel === c.code;
    if ('and' in sel) return sel.and.every(m);
    if ('or' in sel) return sel.or.some(m);
    if ('not' in sel) return !m(sel.not);
    if ('pattern' in sel) return patternMatches(sel.pattern, c.code);
    if ('level' in sel) return c.code[4] === String(sel.level);
    if ('any' in sel) return true;
    if ('set' in sel) {
      const s = this.set(sel.set, doc);
      return s === undefined ? false : m(s);
    }
    if ('in' in sel)
      return c.inst !== undefined && inMember !== undefined && inMember(c.inst, sel.in, doc);
    const f = c.facts;
    if (!f) return false;
    if ('faculty' in sel) return f.faculty === sel.faculty;
    if ('school' in sel) return f.school === sel.school;
    if ('career' in sel) return f.career === sel.career;
    if ('gened' in sel) return f.gen_ed === true;
    return (f.attrs ?? []).includes(sel.attr);
  }

  // Does the selector name `code` literally (a course atom)? Used for catalogue_missing (§7.3).
  names(sel: Selector, code: string, doc: DocCtx, depth = 0): boolean {
    if (depth > 50) return false;
    if (typeof sel === 'string') return sel === code;
    if ('and' in sel) return sel.and.some((s) => this.names(s, code, doc, depth + 1));
    if ('or' in sel) return sel.or.some((s) => this.names(s, code, doc, depth + 1));
    if ('set' in sel) {
      const s = this.set(sel.set, doc);
      return s !== undefined && this.names(s, code, doc, depth + 1);
    }
    return false;
  }
}
