import axios from 'axios';
import { Course } from 'types/api';

/* eslint-disable import/prefer-default-export */
export const getCoursesInfo = async (courseIds: string[]): Promise<Record<string, Course>> => {
  const courses: Record<string, Course> = {};

  courseIds.forEach(async (id) => {
    const res = await axios.get<Course>(`courses/getCourse/${id}`);
    courses[id] = res.data;
  });

  return courses;
};
