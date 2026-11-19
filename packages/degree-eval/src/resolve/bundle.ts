// Identity, merge order, year fallback, `extends` and patch documents (SCHEMA.md §2.2–2.4, §9).
import type { CatalogueProvider, CourseFacts } from '../eval/types';
import type { Diagnostic, Doc } from '../load';
import { applyOps, checkExpect, clone } from './ops';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

// §2.4: local > hand > scraped, whole-document replacement
const RANK: Record<string, number> = { local: 3, hand: 2, scraped: 1, patch: 0 };
const rankOf = (d: Doc) => RANK[String((d.data.provenance as Obj | undefined)?.source)] ?? 0;

export interface ResolvedDoc {
  kind: 'program' | 'specialisation';
  code: string;
  year: number; // the year actually used
  yearFallback: boolean; // no document for the requested year; the nearest one was used (§2.2)
  file: string;
  data: Obj; // after extends and patches
}

export interface CourseEntry {
  code: string;
  year: number;
  file: string;
  data: Obj; // the course entry (original, requires, excludes, status, …)
}

export interface PatchStatus {
  id: string;
  file: string;
  target: string; // e.g. "program 3778 2026", "course_conditions 2026"
  status: 'applied' | 'stale';
  reason?: string;
}

export interface Bundle {
  program(code: string, year: number): ResolvedDoc | undefined;
  specialisation(code: string, year: number): ResolvedDoc | undefined;
  library(year: number): Obj | undefined; // nearest year ≤ `year` (§2.2); no later fallback
  courseEntry(code: string, year: number): CourseEntry | undefined;
  facts(code: string, year: number): CourseFacts | undefined;
  catalogue: CatalogueProvider;
  patchReport(): PatchStatus[];
  diagnostics: Diagnostic[];
}

// The nearest year: exact, else the nearest earlier, else the nearest later (§2.2).
const pickYear = (years: number[], want: number): number | undefined => {
  if (years.includes(want)) return want;
  const earlier = years.filter((y) => y < want).sort((a, b) => b - a)[0];
  return earlier ?? years.filter((y) => y > want).sort((a, b) => a - b)[0];
};

const yearsOf = (target: Obj): ((y: number) => boolean) => {
  const y = target.years;
  if (typeof y === 'number') return (x) => x === y;
  if (isObj(y)) {
    const from = typeof y.from === 'number' ? y.from : -Infinity;
    const to = typeof y.to === 'number' ? y.to : Infinity;
    return (x) => x >= from && x <= to;
  }
  return () => true;
};

export const createBundle = (docs: readonly Doc[], catalogue: CatalogueProvider): Bundle => {
  const diagnostics: Diagnostic[] = [];
  const report: PatchStatus[] = [];
  const reported = new Set<string>();
  const byKey = new Map<string, Doc[]>(); // `${kind}:${code}` → docs
  for (const d of docs) {
    if (d.kind === 'program' || d.kind === 'specialisation') {
      const key = `${d.kind}:${String(d.data.code)}`;
      byKey.set(key, [...(byKey.get(key) ?? []), d]);
    }
  }
  const patches = docs
    .filter((d) => d.kind === 'patch')
    .sort(
      (a, b) =>
        (a.origin === 'local' ? 1 : 0) - (b.origin === 'local' ? 1 : 0) ||
        Number(a.data.priority ?? 0) - Number(b.data.priority ?? 0) ||
        String(a.data.id).localeCompare(String(b.data.id))
    );

  // Patch documents for a target, applied atomically in order; stale ones are reported (§2.4).
  const applyPatches = (data: Obj, kind: string, code: string | undefined, year: number): Obj => {
    let current = data;
    for (const p of patches) {
      const target = isObj(p.data.target) ? p.data.target : {};
      const matches =
        target.kind === kind &&
        (code === undefined || String(target.code) === code) &&
        yearsOf(target)(year);
      if (matches) {
        const label = `${kind}${code === undefined ? '' : ` ${code}`} ${year}`;
        const stale = checkExpect(current, p.data.expect);
        const applied = stale ? undefined : applyOps(current, p.data.ops);
        const reason = stale ?? applied?.error;
        const key = `${String(p.data.id)}@${label}`;
        if (!reported.has(key)) {
          reported.add(key);
          report.push({
            id: String(p.data.id),
            file: p.file,
            target: label,
            status: reason ? 'stale' : 'applied',
            ...(reason ? { reason } : {})
          });
        }
        if (applied?.data) current = applied.data;
      }
    }
    return current;
  };

  const resolved = new Map<string, ResolvedDoc | undefined>();
  const resolve = (
    kind: 'program' | 'specialisation',
    code: string,
    year: number,
    seen: string[] = []
  ): ResolvedDoc | undefined => {
    const memo = `${kind}:${code}:${year}`;
    if (resolved.has(memo)) return resolved.get(memo);
    const candidates = byKey.get(`${kind}:${code}`) ?? [];
    const used = pickYear(
      candidates.map((d) => Number(d.data.year)),
      year
    );
    if (used === undefined) {
      resolved.set(memo, undefined);
      return undefined;
    }
    const base = candidates
      .filter((d) => Number(d.data.year) === used)
      .sort((a, b) => rankOf(b) - rankOf(a))[0] as Doc;
    let data = clone(base.data);
    const ext = isObj(data.extends) ? data.extends : undefined;
    if (ext && typeof ext.year === 'number') {
      const id = `${kind}:${code}:${ext.year}`;
      const parent = seen.includes(id) ? undefined : resolve(kind, code, ext.year, [...seen, memo]);
      if (!parent) {
        diagnostics.push({
          file: base.file,
          level: 'error',
          code: 'EXTENDS_NOT_FOUND',
          message: `extends ${kind} ${code} ${ext.year}: not found (or a cycle)`
        });
      } else {
        // §2.3: shallow-merge over the resolved base; `requirements` replaces wholesale
        const { patch, ...own } = data;
        data = { ...clone(parent.data), ...own };
        delete data.extends;
        const patched = applyOps(data, patch);
        if (patched.error !== undefined) {
          diagnostics.push({
            file: base.file,
            level: 'error',
            code: 'EXTENDS_PATCH_FAILED',
            message: `patch over ${kind} ${code} ${ext.year}: ${patched.error}`
          });
        } else data = patched.data;
      }
    }
    data = applyPatches(data, kind, code, used);
    const doc: ResolvedDoc = {
      kind,
      code,
      year: used,
      yearFallback: used !== year,
      file: base.file,
      data
    };
    resolved.set(memo, doc);
    return doc;
  };

  const libraries = docs.filter((d) => d.kind === 'library');
  const library = (year: number): Obj | undefined =>
    libraries
      .filter((d) => Number(d.data.year) <= year)
      .sort((a, b) => Number(b.data.year) - Number(a.data.year) || rankOf(b) - rankOf(a))[0]?.data;

  // Course entries: per course, per year, the highest-ranked entry wins (§2.4); then patches.
  const conditionDocs = docs.filter((d) => d.kind === 'course_conditions');
  const entryYears = new Map<string, number[]>();
  for (const d of conditionDocs) {
    for (const code of Object.keys(isObj(d.data.courses) ? d.data.courses : {})) {
      entryYears.set(code, [...new Set([...(entryYears.get(code) ?? []), Number(d.data.year)])]);
    }
  }
  const yearMaps = new Map<number, { data: Obj; files: Map<string, string> }>();
  const conditionsFor = (year: number) => {
    let m = yearMaps.get(year);
    if (!m) {
      const courses: Obj = {};
      const files = new Map<string, string>();
      const best = new Map<string, number>();
      for (const d of conditionDocs.filter((x) => Number(x.data.year) === year)) {
        for (const [code, entry] of Object.entries(isObj(d.data.courses) ? d.data.courses : {})) {
          if (rankOf(d) >= (best.get(code) ?? -1)) {
            best.set(code, rankOf(d));
            courses[code] = clone(entry);
            files.set(code, d.file);
          }
        }
      }
      const data = applyPatches(
        { kind: 'course_conditions', year, courses },
        'course_conditions',
        undefined,
        year
      );
      m = { data, files };
      yearMaps.set(year, m);
    }
    return m;
  };
  const courseEntry = (code: string, year: number): CourseEntry | undefined => {
    const used = pickYear(entryYears.get(code) ?? [], year);
    if (used === undefined) return undefined;
    const { data, files } = conditionsFor(used);
    const entry = isObj(data.courses) ? data.courses[code] : undefined;
    return isObj(entry)
      ? { code, year: used, file: files.get(code) ?? '', data: entry }
      : undefined;
  };

  return {
    program: (code, year) => resolve('program', String(code), year),
    specialisation: (code, year) => resolve('specialisation', code, year),
    library,
    courseEntry,
    facts: (code, year) => catalogue.get(year)?.get(code),
    catalogue,
    patchReport: () => [...report],
    diagnostics
  };
};

// A map whose `get` falls back to default facts for unlisted courses (fixture `catalogue.default`).
class DefaultingMap extends Map<string, CourseFacts> {
  constructor(private readonly fallback?: Omit<CourseFacts, 'code'>) {
    super();
  }

  override get(code: string): CourseFacts | undefined {
    return super.get(code) ?? (this.fallback ? { ...this.fallback, code } : undefined);
  }
}

// A catalogue that serves the same courses for every year (conformance fixtures, §15.1).
export const staticCatalogue = (
  courses: Record<string, Omit<CourseFacts, 'code'> & { gened?: boolean }>,
  fallback?: Omit<CourseFacts, 'code'>
): CatalogueProvider => {
  const map = new DefaultingMap(fallback);
  for (const [code, f] of Object.entries(courses)) {
    const { gened, ...rest } = f;
    map.set(code, { ...rest, code, ...(gened === undefined ? {} : { gen_ed: gened }) });
  }
  return { get: () => map };
};

// Catalogue facts as plain data, so they can be posted to a Web Worker. `years` holds per-year
// facts; a year with no entry falls back to `courses` (facts that hold for every year), and a course
// missing from both gets `default` when one is given.
export interface CatalogueData {
  years?: Record<string, CourseFacts[]>;
  courses?: CourseFacts[];
  default?: Omit<CourseFacts, 'code'>;
}

export const catalogueFromData = (data: CatalogueData): CatalogueProvider => {
  const build = (facts: CourseFacts[]) => {
    const map = new DefaultingMap(data.default);
    for (const f of data.courses ?? []) map.set(f.code, f);
    for (const f of facts) map.set(f.code, f);
    return map;
  };
  const base = build([]);
  const years = new Map(
    Object.entries(data.years ?? {}).map(([y, facts]) => [Number(y), build(facts)])
  );
  return { get: (year) => years.get(year) ?? base };
};
