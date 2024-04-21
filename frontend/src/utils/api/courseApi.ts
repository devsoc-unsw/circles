import axios from 'axios';
import { Course, SearchCourse } from 'types/api';
import { LIVE_YEAR } from 'config/constants';
import { getToken } from './userApi';

// TODO: Should error handling be done here?
export const searchCourse = async (query: string): Promise<SearchCourse> => {
  const token = await getToken();
  const res = await axios.post(`/courses/searchCourse/${query}`, { params: { token } });
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
  const promises = await Promise.all(
    years.map((year) => axios.get<Course>(`courses/getLegacyCourse/${year}/${courseId}`))
  );
  const legacy: Record<number, Course> = years.reduce(
    (prev, year, index) => ({ ...prev, [year]: promises[index].data }),
    {}
  );
  const current = (await axios.get<Course>(`courses/getCourse/${courseId}`)).data;
  legacy[LIVE_YEAR] = current;
  return legacy;
};
