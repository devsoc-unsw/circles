// M9 done criterion (EVALUATOR.md §8): the progression view comes from the evaluator for
// 3778 + COMPA1, with courses that count nowhere shown as not counted.
import { createLocalClient } from '@circles/degree-eval';
import { CoursesResponse, PlannerResponse } from 'types/userResponse';
import { describe, expect, it } from 'vitest';
import { CourseDetails } from './catalogue';
import { evaluateProgression } from './evaluateProgression';
import loadExampleDocuments from './exampleDocuments';
import { toPlan } from './student';

// the m1-3778-mathc2 fixture's 144 UOC plan, by term
const TERMS = [
  ['COMP1511', 'MATH1131', 'MATH1081'],
  ['COMP1521', 'MATH1231', 'ECON1101'],
  ['COMP1531', 'COMP2521', 'MATH2011'],
  ['COMP2511', 'MATH2501', 'ARTS1090'],
  ['COMP3121', 'COMP3311', 'MATH2121'],
  ['COMP3331', 'MATH3411', 'GENL1062'],
  ['COMP3900', 'COMP6080', 'GENL2020'],
  ['COMP4920', 'COMP6441', 'COMP9417']
];

const planner: PlannerResponse = {
  unplanned: [],
  startYear: 2026,
  isSummerEnabled: false,
  lockedTerms: {},
  years: [0, 1, 2].map((y) => ({
    T0: [],
    T1: TERMS[y * 3] ?? [],
    T2: TERMS[y * 3 + 1] ?? [],
    T3: TERMS[y * 3 + 2] ?? []
  }))
};

const courses: CoursesResponse = Object.fromEntries(
  TERMS.flat().map((code, i) => [
    code,
    {
      code,
      title: `${code} title`,
      uoc: 6,
      mark: i < 3 ? 75 : null,
      plannedFor: `${2026 + Math.floor(i / 9)}T${1 + (Math.floor(i / 3) % 3)}`,
      isMultiterm: false,
      ignoreFromProgression: false
    }
  ])
);

describe('evaluateProgression', () => {
  it('maps the planner to plan instances', () => {
    const plan = toPlan(planner, courses);
    expect(plan).toHaveLength(24);
    expect(plan[0]).toMatchObject({
      iid: 'COMP1511',
      term: 2,
      year: 2026,
      status: 'completed',
      outcome: 'pass',
      mark: 75
    });
    expect(plan.find((i) => i.code === 'COMP9417')).toMatchObject({
      term: 11,
      year: 2028,
      status: 'planned'
    });
  });

  it('renders 3778 + COMPA1 from the evaluator, with not-counted courses', async () => {
    const files = await loadExampleDocuments();
    expect(files.length).toBe(84);
    const r = await evaluateProgression(
      createLocalClient(),
      files,
      { programCode: '3778', specs: ['COMPA1'] },
      planner,
      courses
    );
    expect(r.unplacedSpecs).toEqual([]);
    expect(r.yearFallback).toBe(false);
    expect(r.totalUOC).toBe(144);

    // the major is its own group; its core lists the planned core courses
    expect(r.structure.COMPA1.name).toBeTruthy();
    const core = Object.entries(r.view.COMPA1).find(([, s]) =>
      s.courses.some((c) => c.courseCode === 'COMP1511')
    );
    expect(core?.[1].courses.find((c) => c.courseCode === 'COMP1511')).toMatchObject({
      title: 'COMP1511 title',
      UOC: 6
    });

    // without a minor, 48 UOC of non-major courses meet a 36 UOC free-elective pool
    expect(r.freeElectivesUOC).toBe(36);
    expect(r.notCounted.map((c) => c.courseCode)).toHaveLength(2);
    expect(r.status).not.toBe('met');
    expect(r.summary).toBe(
      'Not met (if the plan goes ahead). 132 of 144 UOC counted. 1 requirement not met'
    );
  });

  it("uses the courses' details: gen-ed counts, equivalents meet core items", async () => {
    // DPST1091 in place of COMP1511 (its equivalent), and a course left in Unplanned
    const swap = (c: string) => (c === 'COMP1511' ? 'DPST1091' : c);
    const withEquivalent: PlannerResponse = {
      ...planner,
      unplanned: ['COMP6841'],
      years: planner.years.map((y) => ({
        T0: [],
        T1: y.T1.map(swap),
        T2: y.T2.map(swap),
        T3: y.T3.map(swap)
      }))
    };
    const codes = [...TERMS.flat().map(swap), 'COMP6841'];
    const ownCourses: CoursesResponse = Object.fromEntries(
      codes.map((code) => [code, { ...(courses[code] ?? courses.COMP1511), code, title: code }])
    );
    const details: Record<string, CourseDetails> = Object.fromEntries(
      codes.map((code) => [
        code,
        {
          code,
          study_level: 'Undergraduate',
          school: '',
          gen_ed: code.startsWith('GENL'),
          equivalents: Object.fromEntries(code === 'DPST1091' ? [['COMP1511', 1]] : [])
        }
      ])
    );

    const r = await evaluateProgression(
      createLocalClient(),
      await loadExampleDocuments(),
      { programCode: '3778', specs: ['COMPA1'] },
      withEquivalent,
      ownCourses,
      details
    );
    expect(r.summary).toBe('Met (if the plan goes ahead). 144 of 144 UOC counted');
    expect(r.notCounted).toEqual([]);
    expect(r.equivalents).toEqual([{ code: 'DPST1091', item: 'Core Courses' }]);
    expect(r.unplannedCount).toBe(1);
    expect(r.undecided).toEqual([]);
  });
});
