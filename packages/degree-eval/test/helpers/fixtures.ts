// Runs a §15 fixture (SCHEMA.md §15.1): build the bundle from `documents` + `inline`, use the
// fixture catalogue for every year, evaluate, and check `nodes`, `courses`, `allocations` and
// `not_counted` with the §15.1 matching rules (reasons ⊇, sets for shares and credits).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect } from 'vitest';
import type { CourseFacts, Evaluation, StudentState } from '../../src';
import {
  checkInstance,
  createBundle,
  evaluate,
  formatDiagnostic,
  loadDocuments,
  nodeAt,
  staticCatalogue
} from '../../src';
import { TEST_DATA } from './test-data';

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

export const runFixture = (fx: Fixture): Evaluation => {
  const files = [
    ...fx.bundle.documents.map((p) => ({
      path: p,
      text: readFileSync(join(TEST_DATA, p), 'utf8'),
      origin: 'repo' as const
    })),
    ...(fx.bundle.inline ?? []).map((d, i) => ({
      path: `${fx.id}#inline[${i}]`,
      text: JSON.stringify(d),
      origin: 'local' as const
    }))
  ];
  const { docs, diagnostics } = loadDocuments(files);
  expect(diagnostics.filter((d) => d.level === 'error').map(formatDiagnostic)).toEqual([]);
  const bundle = createBundle(
    docs,
    staticCatalogue(fx.bundle.catalogue.courses ?? {}, fx.bundle.catalogue.default)
  );
  return evaluate(bundle, fx.student, { trace: true });
};

export const checkFixture = (fx: Fixture): Evaluation => {
  const ev = runFixture(fx);
  for (const [path, want] of Object.entries(fx.expect.nodes ?? {})) {
    const got = nodeAt(ev, path);
    expect(got, `node ${path}`).toBeDefined();
    const actual = {
      ...(want.status !== undefined ? { status: got?.status } : {}),
      ...(want.counted_uoc !== undefined ? { counted_uoc: got?.counted_uoc } : {}),
      ...(want.credited_uoc !== undefined ? { credited_uoc: got?.credited_uoc } : {}),
      ...(want.projected !== undefined ? { projected: got?.projected } : {}),
      ...(want.reasons
        ? { reasons: want.reasons.filter((r) => got?.reasons.some((x) => x.code === r)) }
        : {})
    };
    expect(actual, `node ${path}: ${JSON.stringify(got?.reasons.map((r) => r.text))}`).toEqual(
      want
    );
  }
  for (const [iid, want] of Object.entries(fx.expect.courses ?? {})) {
    const got = checkInstance(ev, iid);
    const actual = {
      ...(want.status !== undefined ? { status: got.status } : {}),
      ...(want.projected !== undefined ? { projected: got.projected } : {}),
      ...(want.reasons
        ? { reasons: want.reasons.filter((r) => got.reasons.some((x) => x.code === r)) }
        : {})
    };
    expect(actual, `course ${iid}`).toEqual(want);
  }
  for (const [iid, want] of Object.entries(fx.expect.allocations ?? {})) {
    const got = ev.instances.get(iid);
    const norm = (p: string | null | undefined) => (p == null ? null : (nodeAt(ev, p)?.path ?? p));
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
    expect(actual, `allocation ${iid}`).toEqual(expected);
  }
  if (fx.expect.not_counted)
    expect([...ev.notCounted].sort()).toEqual([...fx.expect.not_counted].sort());
  return ev;
};
