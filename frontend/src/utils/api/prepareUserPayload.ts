import { parseMarkToInt } from 'pages/TermPlanner/utils';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';
import { APIUserCoursesAndMarks, APIUserData, APIUserSpecs } from './types/requests';

const prepareUserPayload = (degree: DegreeSliceState, planner: PlannerSliceState): APIUserData => {
  const { courses } = planner;
  const { programCode, specs } = degree;

  const specialisations: APIUserSpecs = {};
  specs.forEach((spec) => {
    specialisations[spec] = 1;
  });

  const selectedCourses: APIUserCoursesAndMarks = {};
  Object.entries(courses).forEach(([courseCode, courseData]) => {
    selectedCourses[courseCode] = parseMarkToInt(courseData.mark);
  });

  return {
    program: programCode,
    specialisations,
    courses: selectedCourses
  };
};

export default prepareUserPayload;
