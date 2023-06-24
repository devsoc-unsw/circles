import axios from 'axios';
import { Course } from 'types/api';

// TODO: Remove eslint-disable when next function added
// eslint-disable-next-line import/prefer-default-export
export const handleGetCourseInfo = async (courseId: string) => {
  const res = await axios.get<Course>(`course/getCourses/${courseId}`);
  return res.data;
};
