import axios from 'axios';
import { Course } from 'types/api';

// eslint-disable-next-line import/prefer-default-export
export const getCourse = async (courseId: string) => {
  const res = await axios.get<Course>(`courses/getCourse/${courseId}`);
  return res.data;
};
