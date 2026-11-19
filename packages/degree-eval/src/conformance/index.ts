// Conformance fixtures (SCHEMA.md §15): build a fixture's bundle from `documents` + `inline`, use the
// fixture catalogue for every year, evaluate, and compare `nodes`, `courses`, `allocations` and
// `not_counted` with the §15.1 matching rules (reasons ⊇, sets for shares and credits). Used by the
// test suite and by the CLI, so data repositories can run their fixtures without vitest.
import { checkInstance, evaluate, nodeAt } from '../eval/evaluate';
import type { CourseFacts, Evaluation, StudentState } from '../eval/types';
import type { Diagnostic, SourceFile } from '../load';
import { loadDocuments } from '../load';
import { createBundle, staticCatalogue } from '../resolve/bundle';

type Obj = Record<string, unknown>;

export interface Fixture {
  id: string;
  bundle: {
    documents: string[];
    inline?: Obj[];
    catalogue: {
      default?: Omit<CourseFacts, 'code'>;
      courses?: Record<string, Omit<CourseFacts, 'code'> & { gened?: boolean }>;
    };
  };
  student: StudentState;
  expect: {
    nodes?: Record<
      string,
      {
        status?: string;
        counted_uoc?: number;
        credited_uoc?: number;
        reasons?: string[];
        projected?: boolean;
      }
    >;
    courses?: Record<string, { status?: string; reasons?: string[]; projected?: boolean }>;
    allocations?: Record<
      string,
      { primary?: string | null; shares?: string[]; credits?: string[] }
    >;
    not_counted?: string[];
  };
}

export interface FixtureRun {
  evaluation: Evaluation;
  diagnostics: Diagnostic[]; // loading the bundle
}

// `read` returns a bundle document's text by its fixture path, or undefined when it is missing.
export const runFixture = (fx: Fixture, read: (path: string) => string | undefined): FixtureRun => {
  const missing: Diagnostic[] = [];
  const files: SourceFile[] = [];
  for (const path of fx.bundle.documents) {
    const text = read(path);
    if (text === undefined)
      missing.push({
        file: fx.id,
        level: 'error',
        code: 'DOCUMENT_NOT_FOUND',
        message: `bundle document ${path} not found`
      });
    else files.push({ path, text, origin: 'repo' });
  }
  (fx.bundle.inline ?? []).forEach((d, i) =>
    files.push({ path: `${fx.id}#inline[${i}]`, text: JSON.stringify(d), origin: 'local' })
  );
  const { docs, diagnostics } = loadDocuments(files);
  const bundle = createBundle(
    docs,
    staticCatalogue(fx.bundle.catalogue.courses ?? {}, fx.bundle.catalogue.default)
  );
  return {
    evaluation: evaluate(bundle, fx.student, { trace: true }),
    diagnostics: [...missing, ...diagnostics]
  };
};

const show = (v: unknown) => JSON.stringify(v);

// Every way the evaluation differs from the fixture's `expect`, as readable lines; [] when it passes.
export const compareFixture = (fx: Fixture, ev: Evaluation): string[] => {
  const out: string[] = [];
  const differ = (what: string, actual: unknown, want: unknown, extra = '') => {
    if (show(actual) !== show(want))
      out.push(`${what}: expected ${show(want)}, got ${show(actual)}${extra}`);
  };
  const someReasons = (want: string[] | undefined, got: { code: string }[]) =>
    want ? { reasons: want.filter((r) => got.some((x) => x.code === r)) } : {};

  for (const [path, want] of Object.entries(fx.expect.nodes ?? {})) {
    const got = nodeAt(ev, path);
    if (!got) out.push(`node ${path}: not found`);
    else {
      const actual = {
        ...(want.status !== undefined ? { status: got.status } : {}),
        ...(want.counted_uoc !== undefined ? { counted_uoc: got.counted_uoc } : {}),
        ...(want.credited_uoc !== undefined ? { credited_uoc: got.credited_uoc } : {}),
        ...(want.projected !== undefined ? { projected: got.projected } : {}),
        ...someReasons(want.reasons, got.reasons)
      };
      const ordered = {
        ...(want.status !== undefined ? { status: want.status } : {}),
        ...(want.counted_uoc !== undefined ? { counted_uoc: want.counted_uoc } : {}),
        ...(want.credited_uoc !== undefined ? { credited_uoc: want.credited_uoc } : {}),
        ...(want.projected !== undefined ? { projected: want.projected } : {}),
        ...(want.reasons ? { reasons: want.reasons } : {})
      };
      differ(
        `node ${path}`,
        actual,
        ordered,
        got.reasons.length ? ` (reasons: ${got.reasons.map((r) => r.text).join('; ')})` : ''
      );
    }
  }
  for (const [iid, want] of Object.entries(fx.expect.courses ?? {})) {
    const got = checkInstance(ev, iid);
    const actual = {
      ...(want.status !== undefined ? { status: got.status } : {}),
      ...(want.projected !== undefined ? { projected: got.projected } : {}),
      ...someReasons(want.reasons, got.reasons)
    };
    const ordered = {
      ...(want.status !== undefined ? { status: want.status } : {}),
      ...(want.projected !== undefined ? { projected: want.projected } : {}),
      ...(want.reasons ? { reasons: want.reasons } : {})
    };
    differ(`course ${iid}`, actual, ordered);
  }
  const norm = (p: string | null | undefined) => (p == null ? null : (nodeAt(ev, p)?.path ?? p));
  for (const [iid, want] of Object.entries(fx.expect.allocations ?? {})) {
    const got = ev.instances.get(iid);
    const actual = {
      ...('primary' in want ? { primary: got?.primary ?? null } : {}),
      ...(want.shares ? { shares: [...(got?.shares ?? [])].sort() } : {}),
      ...(want.credits ? { credits: [...(got?.credits ?? [])].sort() } : {})
    };
    const expected = {
      ...('primary' in want ? { primary: norm(want.primary) } : {}),
      ...(want.shares ? { shares: want.shares.map((s) => norm(s) as string).sort() } : {}),
      ...(want.credits ? { credits: want.credits.map((s) => norm(s) as string).sort() } : {})
    };
    differ(`allocation ${iid}`, actual, expected);
  }
  if (fx.expect.not_counted)
    differ('not_counted', [...ev.notCounted].sort(), [...fx.expect.not_counted].sort());
  return out;
};
