import axios from 'axios';
import type { CourseLegacyOfferings, PlannerCourse, Term } from 'types/planner';

export type ManyCoursesOfferings = {
  [course: string]: CourseLegacyOfferings;
};

type APIResult = {
  terms: {
    [year: string]: Term[] | null;
  };
  fails: unknown[];
};

const getAllCourseOfferings = async (
  courses: string[],
  years: string[]
): Promise<ManyCoursesOfferings> => {
  if (courses.length === 0 || years.length === 0) {
    return {};
  }

  const yearsStr = years.join('+');
  const offers: ManyCoursesOfferings = {};

  await Promise.all(
    courses.map(async (course) => {
      try {
        const res = await axios.get<APIResult>(`/courses/termsOffered/${course}/${yearsStr}`);
        if (res.status === 200) {
          offers[course] = {};
          Object.entries(res.data.terms).forEach(([year, terms]) => {
            // remove null for old years
            offers[course][year] = terms ?? [];
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getting courses terms offered', e);
      }
    })
  );

  return offers;
};

export const courseHasOffering = (course: PlannerCourse, year: string, term: Term): boolean => {
  if (course.legacyOfferings === undefined) {
    // fall back to the current offerings
    return course.termsOffered.includes(term);
  }

  return year in course.legacyOfferings && course.legacyOfferings[year].includes(term);
};

export default getAllCourseOfferings;
