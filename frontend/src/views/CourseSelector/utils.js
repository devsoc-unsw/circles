import { parseMarkToInt } from "views/TermPlanner/utils";

const prepareUserPayload = (degree, planner) => {
  const { startYear, courses } = planner;
  const { programCode, specs } = degree;

  const specialisations = {};
  specs.forEach((spec) => { specialisations[spec] = 1; });

  const selectedCourses = {};
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
