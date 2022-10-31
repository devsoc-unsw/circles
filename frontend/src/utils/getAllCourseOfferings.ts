import axios from 'axios';
import { Term } from 'types/planner';

export type CourseOfferings = {
  [course: string]: {
    [year: string]: Term[];
  };
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
): Promise<CourseOfferings> => {
  const yearsStr = years.join('+');
  const offers: CourseOfferings = {};
  await Promise.all(
    courses.map(async (course) => {
      try {
        const res = await axios.get<APIResult>(`/courses/termsOffered/${course}/${yearsStr}`);
        if (res.status === 200) {
          let mostRecentYear: Term[] = [];
          offers[course] = {};
          Object.entries(res.data.terms).forEach(([year, terms]) => {
            offers[course][year] = terms ?? mostRecentYear;
            if (terms !== null) {
              mostRecentYear = terms;
            }
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

export const courseHasOffering = (
  code: string,
  year: string,
  term: string,
  offerings: CourseOfferings
): boolean => {
  return (
    code in offerings && year in offerings[code] && offerings[code][year].includes(term as Term)
  );
};

export default getAllCourseOfferings;
