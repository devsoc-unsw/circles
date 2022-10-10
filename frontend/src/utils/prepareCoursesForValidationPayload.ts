import getMostRecentPastTerm, { MostRecentTerm } from 'utils/getMostRecentPastTerm';
import { parseMarkToInt } from 'pages/TermPlanner/utils';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';

type TermPlan = {
  // key = course code, value = [UOC, mark]
  [courseCode: string]: [number, number | null];
};

type YearPlan = TermPlan[];

type CoursesForValidationPayload = {
  program: string;
  specialisations: string[];
  plan: YearPlan[];
  mostRecentPastTerm: MostRecentTerm;
};

const prepareCoursesForValidationPayload = (
  planner: PlannerSliceState,
  degree: DegreeSliceState,
  showWarnings: boolean
): CoursesForValidationPayload => {
  const { years, startYear, courses } = planner;
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
    plan,
    mostRecentPastTerm: showWarnings ? { Y: 0, T: 0 } : getMostRecentPastTerm(startYear)
  };
};

export default prepareCoursesForValidationPayload;
