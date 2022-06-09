import { getMostRecentPastTerm } from "pages/TermPlanner/utils";

const getPastCourses = (years, startYear, courses) => {
  const { Y: recentYear, T: recentTerm } = getMostRecentPastTerm(startYear);
  const newPastCourses = {};

  // get courses and their matching information for table columns
  // only from past terms, by ignoring future years and terms in the planner
  years.slice(0, recentYear).forEach((year, yearIndex) => {
    Object.values(year).forEach((term, termIndex) => {
      Object.values(term).forEach((course) => {
        if (yearIndex < recentYear - 1 || termIndex <= recentTerm) {
          const currCourse = {};
          currCourse.title = courses[course].title;
          currCourse.UOC = courses[course].UOC;
          currCourse.type = courses[course].type;
          const currYear = (startYear + yearIndex).toString().slice(-2);
          currCourse.termTaken = `${currYear}T${termIndex}`;

          newPastCourses[course] = currCourse;
        }
      });
    });
  });

  return newPastCourses;
};

export default getPastCourses;
