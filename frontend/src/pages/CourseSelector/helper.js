export const prepareUserPayload = (degree, planner) => {
  const { startYear, courses } = planner;
  const { programCode, specialisation, minor } = degree;

  const specialisations = {};
  specialisations[specialisation] = 1;
  if (minor !== "") specialisations[minor] = 1;

  let selectedCourses = {};
  for (const course of courses.keys()) {
    selectedCourses[course] = 70;
  }

  return {
    program: programCode,
    specialisations: specialisations,
    courses: selectedCourses,
    year: new Date().getFullYear() - startYear,
  };
};
