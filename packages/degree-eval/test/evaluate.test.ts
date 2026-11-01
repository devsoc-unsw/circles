// Evaluator paths the conformance fixtures do not reach: patches, extends, auto-choice,
// substitutions, exemptions, spec exclusions, conditions and pins.
import { describe, expect, it } from 'vitest';
import type { StudentState } from '../src';
import {
  checkInstance,
  createBundle,
  evaluate,
  explain,
  loadDocuments,
  staticCatalogue,
  unlockedAt
} from '../src';

const doc = (o: Record<string, unknown>) =>
  JSON.stringify({ schema_version: '1.0', year: 2026, provenance: { source: 'hand' }, ...o });

const LIB = doc({ kind: 'library', sets: { cs: 'COMP****' }, program_groups: { cse: ['3778'] } });
const PROGRAM = doc({
  kind: 'program',
  code: '9000',
  title: 'Test',
  uoc: 24,
  requirements: [
    { id: 'core', kind: 'core', courses: ['COMP1511', 'MATH1131 or MATH1141'] },
    {
      id: 'choice',
      kind: 'group',
      choose: { min: 1, max: 1 },
      children: [
        { id: 'a', kind: 'pool', from: 'ARTS****', uoc: 6 },
        { id: 'b', kind: 'pool', from: '@cs', uoc: 6 }
      ]
    },
    {
      id: 'free',
      kind: 'pool',
      role: 'free_elective',
      from: 'any',
      overflow: true,
      uoc: { min: 0 }
    },
    { id: 'wam-check', kind: 'check', require: 'wam(65)' },
    { id: 'l2', kind: 'maturity', applies_to: 'level:2', require: 'uoc(12)' }
  ],
  substitutions: [{ replace: 'COMP1511', with: 'COMP1911' }],
  exemptions: [{ courses: ['MATH1131'], when: 'program(@cse)' }]
});
const CONDITIONS = doc({
  kind: 'course_conditions',
  courses: {
    COMP2521: { status: 'parsed', requires: 'COMP1511 or COMP1911' },
    COMP1911: { status: 'none', excludes: [{ program: ['9000'] }] }
  }
});
const PATCH = JSON.stringify({
  schema_version: '1.0',
  kind: 'patch',
  id: 'p1',
  target: { kind: 'program', code: '9000', years: 2026 },
  provenance: { source: 'patch' },
  expect: { 'core.title': 'Old title' },
  ops: [{ op: 'set', target: 'core', fields: { title: 'New' } }]
});

const catalogue = staticCatalogue({}, { uoc: 6, faculty: 'ENG' });
const bundleOf = (...texts: string[]) => {
  const { docs, diagnostics } = loadDocuments(
    texts.map((text, i) => ({ path: `d${i}.yaml`, text, origin: 'repo' }))
  );
  expect(diagnostics.filter((d) => d.level === 'error')).toEqual([]);
  return createBundle(docs, catalogue);
};
const plan = (codes: [string, number][], extra: Partial<StudentState> = {}): StudentState => ({
  program: '9000',
  year: 2026,
  plan: codes.map(([code, term]) => ({
    iid: code.toLowerCase(),
    code,
    term,
    status: 'completed',
    outcome: 'pass',
    mark: 70
  })),
  ...extra
});

describe('evaluate', () => {
  it('auto-chooses a choice group by the §7.5 order and applies a substitution', () => {
    const ev = evaluate(
      bundleOf(LIB, PROGRAM),
      plan([
        ['COMP1911', 1],
        ['MATH1131', 1],
        ['COMP2521', 2],
        ['COMP2041', 3]
      ]),
      { trace: true }
    );
    expect(ev.nodes.get('choice')?.autoSelected).toEqual(['b']); // `a` would leave a pool unmet
    expect(ev.instances.get('comp1911')?.primary).toBe('core'); // substituted alternative
    expect(ev.nodes.get('core')?.status).toBe('met');
    expect(ev.root.status).toBe('met');
    expect(explain(ev, { iid: 'comp1911' })[0]).toMatchObject({ step: '1a', action: 'primary' });
  });

  it('applies an exemption only when its `when` holds', () => {
    const ev = evaluate(bundleOf(LIB, PROGRAM), plan([['COMP1511', 1]]));
    expect(ev.nodes.get('core')?.reasons.map((r) => r.code)).toEqual(['not_planned']); // 9000 is not @cse
  });

  it('evaluates check and maturity conditions', () => {
    const low = evaluate(bundleOf(LIB, PROGRAM), {
      ...plan([
        ['COMP1511', 1],
        ['COMP2521', 1]
      ]),
      plan: [
        { iid: 'a', code: 'COMP1511', term: 1, status: 'completed', outcome: 'pass', mark: 50 },
        { iid: 'b', code: 'COMP2521', term: 1, status: 'completed', outcome: 'pass', mark: 60 }
      ]
    });
    expect(low.nodes.get('wam-check')?.status).toBe('unmet');
    expect(low.nodes.get('l2')?.status).toBe('unmet'); // COMP2521 in term 1 with 0 UOC before it
  });

  it('checks a course entry: requires, structured spec/program exclusions, missing data', () => {
    const ev = evaluate(bundleOf(LIB, PROGRAM, CONDITIONS), {
      ...plan([['COMP1511', 1]]),
      plan: [
        { iid: 'c1', code: 'COMP1511', term: 1, status: 'completed', outcome: 'pass', mark: 70 },
        // a second term-1 course satisfies the program's level-2 maturity rule, uoc(12)
        { iid: 'm1', code: 'MATH1131', term: 1, status: 'completed', outcome: 'pass', mark: 70 },
        { iid: 'c2', code: 'COMP2521', term: 2, status: 'planned' },
        { iid: 'c3', code: 'COMP1911', term: 2, status: 'planned' }
      ]
    });
    expect(checkInstance(ev, 'c2')).toMatchObject({ status: 'met', projected: true });
    expect(checkInstance(ev, 'c3').status).toBe('unmet');
    expect(checkInstance(ev, 'c3').reasons.map((r) => r.code)).toContain('excluded');
    expect(unlockedAt(ev, 1, ['COMP2521']).get('COMP2521')?.status).toBe('unmet');
    expect(unlockedAt(ev, 3, ['COMP9999']).get('COMP9999')?.reasons[0]?.code).toBe(
      'no_condition_data'
    );
  });

  it('reports a stale patch and leaves the document unchanged', () => {
    const bundle = bundleOf(LIB, PROGRAM, PATCH);
    expect(bundle.program('9000', 2026)?.data.requirements).toBeDefined();
    expect(bundle.patchReport()).toEqual([expect.objectContaining({ id: 'p1', status: 'stale' })]);
  });

  it('resolves extends with year fallback and patch ops', () => {
    const next = JSON.stringify({
      schema_version: '1.0',
      kind: 'program',
      code: '9000',
      year: 2027,
      extends: { year: 2026 },
      provenance: { source: 'hand' },
      patch: [{ op: 'remove', target: 'wam-check' }]
    });
    const bundle = bundleOf(LIB, PROGRAM, next);
    const p = bundle.program('9000', 2028);
    expect(p).toMatchObject({ year: 2027, yearFallback: true });
    expect((p?.data.requirements as { id: string }[]).map((n) => n.id)).toEqual([
      'core',
      'choice',
      'free',
      'l2'
    ]);
  });

  it('honours pins and reports not-counted instances', () => {
    const ev = evaluate(
      bundleOf(LIB, PROGRAM),
      plan(
        [
          ['COMP2041', 1],
          ['COMP2511', 1]
        ],
        { pins: { comp2511: 'free' }, selections: { choice: ['a'] } }
      )
    );
    expect(ev.instances.get('comp2511')?.primary).toBe('free');
    expect(ev.nodes.get('choice')?.selected).toEqual(['a']);
    expect(ev.notCounted).toEqual([]);
  });
});

describe('program and specialisation totals', () => {
  const program = (specUoc: unknown) => [
    doc({
      kind: 'program',
      code: '9000',
      title: 'Totals',
      uoc: 12,
      requirements: [
        { id: 'major', kind: 'spec', slot: 'major', options: ['TESTA1'], default: 'TESTA1' },
        { id: 'free', kind: 'pool', role: 'free_elective', from: 'any', overflow: true, uoc: 6 }
      ]
    }),
    doc({
      kind: 'specialisation',
      code: 'TESTA1',
      title: 'Test major',
      spec_kind: 'major',
      uoc: specUoc,
      requirements: [{ id: 'core', kind: 'core', courses: ['COMP1511', 'COMP1521'] }]
    })
  ];
  // 12 UOC in the major (6 more than its 6), 18 UOC in all (6 more than the program's 12)
  const extra = plan([
    ['COMP1511', 1],
    ['COMP1521', 1],
    ['ARTS1000', 2]
  ]);

  it('an integer total is a minimum: courses beyond it do not fail the degree', () => {
    const ev = evaluate(bundleOf(...program(6)), extra);
    expect(ev.nodes.get('major/TESTA1')).toMatchObject({ status: 'met', counted_uoc: 12 });
    expect(ev.root).toMatchObject({ status: 'met', counted_uoc: 18, required_uoc: { min: 12 } });
  });

  it('a {min, max} total keeps its maximum', () => {
    const ev = evaluate(bundleOf(...program({ min: 6, max: 6 })), extra);
    expect(ev.nodes.get('major/TESTA1')?.status).toBe('unmet');
    expect(ev.nodes.get('major/TESTA1')?.reasons.map((r) => r.code)).toContain('above_max');
  });
});

describe('top-up (§7.4 step 4)', () => {
  it('a quota maximum does not make a {min} pool take every course; the rest overflow', () => {
    const bundle = bundleOf(
      doc({
        kind: 'program',
        code: '9000',
        title: 'Electives',
        uoc: 24,
        requirements: [
          {
            id: 'electives',
            kind: 'pool',
            from: 'COMP****',
            uoc: { min: 12 },
            quotas: [{ from: 'COMP4***', uoc: { max: 6 } }]
          },
          { id: 'free', kind: 'pool', role: 'free_elective', from: 'any', overflow: true, uoc: 12 }
        ]
      })
    );
    // 24 UOC of COMP: 12 meet the electives' minimum, the other 12 are free electives
    const ev = evaluate(
      bundle,
      plan([
        ['COMP1511', 1],
        ['COMP1521', 1],
        ['COMP2521', 2],
        ['COMP2511', 2]
      ])
    );
    expect(ev.nodes.get('electives')).toMatchObject({ status: 'met', counted_uoc: 12 });
    expect(ev.nodes.get('free')).toMatchObject({ status: 'met', counted_uoc: 12 });
    expect(ev.root.status).toBe('met');
  });
});
