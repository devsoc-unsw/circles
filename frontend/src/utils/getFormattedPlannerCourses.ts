import { PlannerCourse, PlannerYear } from 'types/planner';
import getMostRecentPastTerm from 'utils/getMostRecentPastTerm';

export type FormattedPlannerCourse = {
  title: string
  UOC: number
  termPlanned: string
  past: boolean
};

const getFormattedPlannerCourses = (
  years: PlannerYear[],
  startYear: number,
  courses: Record<string, PlannerCourse>,
) => {
  const { Y: currYearInDeg, T: currTermInDeg } = getMostRecentPastTerm(startYear);
  const plannerCourses: Record<string, FormattedPlannerCourse> = {};

  years.forEach((year, yearIndex) => {
    Object.values(year).forEach((term, termIndex) => {
      Object.values(term).forEach((course) => {
        const currYear = (startYear + yearIndex).toString().slice(-2);
        const currCourse: FormattedPlannerCourse = {
          title: courses[course].title,
          UOC: courses[course].UOC,
          termPlanned: `${currYear}T${termIndex}`,
          past: yearIndex < currYearInDeg - 1
                          || (yearIndex === currYearInDeg - 1 && termIndex <= currTermInDeg),
        };
        plannerCourses[course] = currCourse;
      });
    });
  });

  return plannerCourses;
};

export default getFormattedPlannerCourses;
