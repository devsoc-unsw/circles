import { DegreeResponse, PlannerResponse } from 'types/userResponse';
import { parseMarkToInt } from 'pages/TermPlanner/utils';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';

// key = course code, value = mark of course (number | null)
type UserPayloadCourse = Record<string, number | null>;

type UserPayload = {
  program: string;
  courses: UserPayloadCourse;
  specialisations: string[];
};

// TODO: Remove the slice types once fully migrated
const prepareUserPayload = (
  degree: DegreeResponse | DegreeSliceState,
  planner: PlannerResponse | PlannerSliceState
): UserPayload => {
  const { courses } = planner;
  const { programCode, specs } = degree;

  const selectedCourses: UserPayloadCourse = {};
  Object.entries(courses).forEach(([courseCode, courseData]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    selectedCourses[courseCode] = parseMarkToInt(courseData.mark);
  });
  planner.unplanned.forEach((courseCode) => {
    selectedCourses[courseCode] = null;
  });

  return {
    program: programCode,
    specialisations: specs,
    courses: selectedCourses
  };
};

export default prepareUserPayload;
