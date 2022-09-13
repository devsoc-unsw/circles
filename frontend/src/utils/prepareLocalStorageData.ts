import getMostRecentPastTerm from 'utils/getMostRecentPastTerm';
import { parseMarkToInt } from 'pages/TermPlanner/utils';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';
import { CoursesForValidationPayload } from './prepareCoursesForValidationPayload';

type TermPlan = {
  // key = course code, value = [UOC, mark]
  [courseCode: string]: [number, number | null]
};

type YearPlan = TermPlan[];

type LocalStorageData = CoursesForValidationPayload & {
  programName: string
  startYear: number
  numYears: number
  unplanned: string[]
  isSummerEnabled: boolean
  token: string
};

const prepareLocalStorageData = (
  planner: PlannerSliceState,
  degree: DegreeSliceState,
  token: string,
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
    mostRecentPastTerm: getMostRecentPastTerm(startYear) ?? { Y: 0, T: 0 },
    programName,
    unplanned,
    startYear,
    numYears,
    isSummerEnabled,
    token,
  };
};

export default prepareLocalStorageData;
