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

const prepareUserPayload = (degree: DegreeSliceState, planner: PlannerSliceState): UserPayload => {
  const { courses } = planner;
  const { programCode, specs } = degree;

  const selectedCourses: UserPayloadCourse = {};
  Object.entries(courses).forEach(([courseCode, courseData]) => {
    selectedCourses[courseCode] = parseMarkToInt(courseData.mark);
  });

  return {
    program: programCode,
    specialisations: specs,
    courses: selectedCourses
  };
};

export default prepareUserPayload;
