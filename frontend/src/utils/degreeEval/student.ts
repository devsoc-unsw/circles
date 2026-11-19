// Planner state → the evaluator's StudentState (SCHEMA.md §7.1).
import type { PlanInstance, StudentState } from '@circles/degree-eval';
import { Mark } from 'types/planner';
import { CoursesResponse, PlannerResponse } from 'types/userResponse';

const TERMS = ['T0', 'T1', 'T2', 'T3'];

// A mark means the course is done. Circles stores either a number or a letter grade.
const resultOf = (mark: Mark | undefined): Partial<PlanInstance> => {
  if (mark === null || mark === undefined) return { status: 'planned' };
  if (typeof mark === 'number')
    return { status: 'completed', outcome: mark < 50 ? 'fail' : 'pass', mark };
  if (mark === 'SY') return { status: 'completed', outcome: 'pass_no_mark', grade: mark };
  return { status: 'completed', outcome: mark === 'FL' ? 'fail' : 'pass', grade: mark };
};

// One instance per course per planned term. A multi-term course (VIP ENGG2600: 2 UOC a term, 6 over
// three terms) appears in every term it spans, and each occurrence counts its `uoc`: the backend
// places it in that many terms and stores the UOC of one occurrence. Repeats get iids CODE#2, CODE#3.
// Terms are numbered across the whole plan (four per year, summer first); `year` is the calendar
// year of that term, which picks the catalogue and handbook year (§7.1).
export const toPlan = (planner: PlannerResponse, courses: CoursesResponse): PlanInstance[] => {
  const seen = new Map<string, number>();
  return planner.years.flatMap((year, y) =>
    TERMS.flatMap((term, t) =>
      (year[term] ?? []).map((code): PlanInstance => {
        const n = (seen.get(code) ?? 0) + 1;
        seen.set(code, n);
        return {
          iid: n === 1 ? code : `${code}#${n}`,
          code,
          term: y * TERMS.length + t + 1,
          year: planner.startYear + y,
          status: 'planned',
          ...resultOf(courses[code]?.mark)
        };
      })
    )
  );
};

export const toStudent = (
  programCode: string,
  planner: PlannerResponse,
  courses: CoursesResponse,
  selections: Record<string, string[]>
): StudentState => {
  const plan = toPlan(planner, courses);
  return {
    program: programCode,
    year: planner.startYear,
    horizon: 'planned',
    selections,
    plan,
    ignored: plan.filter((i) => courses[i.code]?.ignoreFromProgression).map((i) => i.iid),
    // T0 of each year, which `consecutive` timing rules may skip (VIP over T3 and the next T1)
    summerTerms: planner.years.map((_, y) => y * TERMS.length + 1)
  };
};
