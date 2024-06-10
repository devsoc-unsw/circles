import axios from 'axios';
import { Course, SearchCourse } from 'types/api';
import { LIVE_YEAR } from 'config/constants';
import { withAuthorization } from './auth';

// TODO: Should error handling be done here?
export const searchCourse = async (token: string, query: string): Promise<SearchCourse> => {
  const res = await axios.post(
    `/courses/searchCourse/${query}`,
    {},
    { headers: { ...withAuthorization(token) } }
  );
  return res.data as SearchCourse;
};

export const getCourseInfo = async (courseId: string) => {
  const res = await axios.get<Course>(`courses/getCourse/${courseId}`);
  return res.data;
};

export const getCourseForYearsInfo = async (
  courseId: string,
  years: number[]
): Promise<Record<number, Course>> => {
  const promises = await Promise.allSettled(
    years.map((year) => axios.get<Course>(`courses/getLegacyCourse/${year}/${courseId}`))
  );
  const legacy: Record<number, Course> = {};
  promises.forEach((promise, index) => {
    if (promise.status === 'fulfilled') {
      legacy[years[index]] = promise.value.data;
    }
  });
  const current = (await axios.get<Course>(`courses/getCourse/${courseId}`)).data;
  legacy[LIVE_YEAR] = current;
  return legacy;
};
