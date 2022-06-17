import { getMostRecentPastTerm } from "pages/TermPlanner/utils";

const getFormattedPlannerCourses = (years, startYear, courses) => {
  const { Y: currYearInDeg, T: currTermInDeg } = getMostRecentPastTerm(startYear);
  const plannerCourses = {};

  years.forEach((year, yearIndex) => {
    Object.values(year).forEach((term, termIndex) => {
      Object.values(term).forEach((course) => {
        const currCourse = {};
        currCourse.title = courses[course].title;
        currCourse.UOC = courses[course].UOC;
        currCourse.type = courses[course].type;
        const currYear = (startYear + yearIndex).toString().slice(-2);
        currCourse.termPlanned = `${currYear}T${termIndex}`;
        currCourse.past = yearIndex < currYearInDeg - 1
                          || (yearIndex === currYearInDeg - 1 && termIndex <= currTermInDeg);
        plannerCourses[course] = currCourse;
      });
    });
  });

  return plannerCourses;
};

export default getFormattedPlannerCourses;
