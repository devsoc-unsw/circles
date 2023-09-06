import axios from 'axios';
import { SearchCourse } from 'types/api';
import { getToken } from './userApi';

// TODO: Should error handling be done here?
// eslint-disable-next-line import/prefer-default-export
export const searchCourse = async (query: string): Promise<SearchCourse> => {
  const token = await getToken();
  const res = await axios.post(`/courses/searchCourse/${query}`, { params: { token } });
  return res.data as SearchCourse;
};
