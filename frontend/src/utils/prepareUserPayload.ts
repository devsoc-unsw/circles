import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import { parseMarkToInt } from 'pages/TermPlanner/utils';

// key = course code, value = mark of course (number | null)
type UserPayloadCourse = Record<string, number | null>;

type UserPayload = {
  program: string;
  courses: UserPayloadCourse;
  specialisations: string[];
};

// TODO: Remove the slice types once fully migrated
const prepareUserPayload = (
  degree: DegreeResponse,
  planner: PlannerResponse,
  courses: CoursesResponse
): UserPayload => {
  const { programCode, specs } = degree;

  const selectedCourses: UserPayloadCourse = {};
  Object.entries(courses).forEach(([courseCode, courseData]) => {
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
