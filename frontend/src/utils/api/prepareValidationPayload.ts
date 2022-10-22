import getMostRecentPastTerm from 'utils/getMostRecentPastTerm';
import { parseMarkToInt } from 'pages/TermPlanner/utils';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';
import { APIPlannerData, APITermPlan, APIYearPlan } from './types/requests';

const prepareValidationPayload = (
  planner: PlannerSliceState,
  degree: DegreeSliceState,
  showWarnings: boolean
): APIPlannerData => {
  const { years, startYear, courses } = planner;
  const { programCode, specs } = degree;

  const plan: APIYearPlan[] = [];
  years.forEach((year) => {
    const formattedYear: APIYearPlan = [];
    Object.values(year).forEach((term) => {
      const coursesData: APITermPlan = {};
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

export default prepareValidationPayload;
