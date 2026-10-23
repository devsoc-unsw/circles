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

// One instance per course per planned term, except a multi-term course: the planner repeats its
// code in every term it spans, but it is one enrolment (one UOC total), so its terms collapse into
// one instance in the last of them, when it completes. Terms are numbered across the whole plan
// (four per year, summer first); `year` is the calendar year of that term, which picks the
// catalogue and handbook year (§7.1).
export const toPlan = (planner: PlannerResponse, courses: CoursesResponse): PlanInstance[] => {
  const placed = planner.years.flatMap((year, y) =>
    TERMS.flatMap((term, t) =>
      (year[term] ?? []).map((code) => ({
        code,
        term: y * TERMS.length + t + 1,
        year: planner.startYear + y
      }))
    )
  );
  const lastTerm = new Map(placed.map((p) => [p.code, p.term])); // later terms overwrite
  const seen = new Map<string, number>();
  return placed
    .filter((p) => !courses[p.code]?.isMultiterm || lastTerm.get(p.code) === p.term)
    .map(({ code, term, year }): PlanInstance => {
      const n = (seen.get(code) ?? 0) + 1;
      seen.set(code, n);
      return {
        iid: n === 1 ? code : `${code}#${n}`,
        code,
        term,
        year,
        status: 'planned',
        ...resultOf(courses[code]?.mark)
      };
    });
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
    ignored: plan.filter((i) => courses[i.code]?.ignoreFromProgression).map((i) => i.iid)
  };
};
