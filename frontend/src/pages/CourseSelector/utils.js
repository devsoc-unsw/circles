const prepareUserPayload = (degree, planner) => {
  const { startYear, courses } = planner;
  const { programCode, majors, minors } = degree;

  const specialisations = {};
  majors.forEach((major) => { specialisations[major] = 1; });
  minors.forEach((minor) => { specialisations[minor] = 1; });

  const selectedCourses = {};
  Array.from(Object.keys(courses)).forEach((course) => {
    selectedCourses[course] = null;
  });

  return {
    program: programCode,
    specialisations,
    courses: selectedCourses,
    year: new Date().getFullYear() - startYear,
  };
};

export default prepareUserPayload;
