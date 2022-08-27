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
  programCode: string
  specialisations: string[]
  year: number
  plan: YearPlan[]
  mostRecentPastTerm: MostRecentTerm
  programName: string
  numYears: number
  unplanned: string[]
  isSummerEnabled: boolean
};

const prepareLocalStorageData = (
  planner: PlannerSliceState,
  degree: DegreeSliceState,
  showWarnings: boolean,
): LocalStorageData => {
  const {
    years, startYear, courses, unplanned, numYears, isSummerEnabled,
  } = planner;
  const { programCode, programName, specs } = degree;

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
    programCode,
    specialisations: specs,
    year: 1,
    plan,
    mostRecentPastTerm: showWarnings ? { Y: 0, T: 0 } : getMostRecentPastTerm(startYear),
    programName,
    unplanned,
    numYears,
    isSummerEnabled,
  };
};

export default prepareLocalStorageData;
