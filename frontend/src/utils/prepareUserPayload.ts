import { parseMarkToInt } from 'pages/TermPlanner/utils';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';

// key = course code, value = mark of course (number | null)
type UserPayloadCourse = Record<string, number | null>;

// key = spec, value = 1
type UserPayloadSpecialisations = Record<string, 1>;

interface UserPayload {
  program: string
  year: number
  courses: UserPayloadCourse
  specialisations: UserPayloadSpecialisations
}

const prepareUserPayload = (degree: DegreeSliceState, planner: PlannerSliceState): UserPayload => {
  const { startYear, courses } = planner;
  const { programCode, specs } = degree;

  const specialisations: UserPayloadSpecialisations = {};
  specs.forEach((spec) => { specialisations[spec] = 1; });

  const selectedCourses: UserPayloadCourse = {};
  Object.entries(courses).forEach(([courseCode, courseData]) => {
    selectedCourses[courseCode] = parseMarkToInt(courseData.mark);
  });

  return {
    program: programCode,
    specialisations,
    courses: selectedCourses,
    year: new Date().getFullYear() - startYear,
  };
};

export default prepareUserPayload;
