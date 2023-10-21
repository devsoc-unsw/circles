import axios from 'axios';
import { Course, SearchCourse } from 'types/api';
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