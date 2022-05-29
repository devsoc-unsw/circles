/* eslint-disable */

const parseMarkToInt = (mark) => {
  if (!isNaN(mark)) {
    return parseInt(mark);
  }
  const letterGradeToIntMap = {
    "FL": 25,
    "PS": 60,
    "CR": 70,
    "DN": 80,
    "HD": 90
  };
  return (mark in letterGradeToIntMap) ? letterGradeToIntMap[mark] : null;
}

const prepareUserPayload = (degree, planner) => {
  const { startYear, courses } = planner;
  console.log("the courses list in util:", courses);
  const { programCode, majors, minor } = degree;

  const specialisations = {};
  majors.forEach((major) => { specialisations[major] = 1; });
  if (minor !== "") specialisations[minor] = 1;

  
  const selectedCourses = {};
  Object.entries(courses).forEach(([courseCode, courseData]) => {
    selectedCourses[courseCode] = parseMarkToInt(courseData.mark);
  })

  return {
    program: programCode,
    specialisations,
    courses: selectedCourses,
    year: new Date().getFullYear() - startYear,
  };
};

export default prepareUserPayload;

export { parseMarkToInt };
