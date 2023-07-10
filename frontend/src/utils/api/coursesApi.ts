import axios from 'axios';
import { Course } from 'types/api';

export const getCoursesInfo = async (courseIds: string[]): Promise<Record<string, Course>> => {
  const courses: Record<string, Course> = {};
  courseIds.forEach(async (id) => {
    const res = await axios.get<Course>(`course/getCourse/${id}`);
    courses[id] = res.data;
  });
  return courses;
};
