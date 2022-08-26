import getMostRecentPastTerm, { MostRecentTerm } from 'utils/getMostRecentPastTerm';
import { parseMarkToInt } from 'pages/TermPlanner/utils';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';

type TermPlan = {
  // key = course code, value = [UOC, mark]
  [courseCode: string]: [number, number | null]
};

type YearPlan = TermPlan[];

type LocalStorageData = {
  program: string
  year: number
  specialisations: string[]
  plan: YearPlan[]
  mostRecentPastTerm: MostRecentTerm
  unplanned: string[]
};

const prepareLocalStorageData = (
  planner: PlannerSliceState,
  degree: DegreeSliceState,
  showWarnings: boolean,
): LocalStorageData => {
  const {
    years, startYear, courses, unplanned,
  } = planner;
  const { programCode, specs } = degree;

  const plan: YearPlan[] = [];
  years.forEach((year) => {
    const formattedYear: YearPlan = [];
    Object.values(year).forEach((term) => {
      const coursesData: TermPlan = {};
      Object.values(term).forEach((c) => {
        coursesData[c] = [courses[c].UOC, parseMarkToInt(courses[c].mark)];
      });
      formattedYear.push(coursesData);
    });
    plan.push(formattedYear);
  });

  return {
    program: programCode,
    specialisations: specs,
    year: 1,
    plan,
    mostRecentPastTerm: showWarnings ? { Y: 0, T: 0 } : getMostRecentPastTerm(startYear),
    unplanned,
  };
};

export default prepareLocalStorageData;
