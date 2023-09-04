import axios from 'axios';
import { Course } from 'types/api';
import { getUserPlanner } from './userApi';

/* eslint-disable import/prefer-default-export */
export const getCoursesInfo = async (): Promise<Record<string, Course>> => {
  const courses: Record<string, Course> = {};
  const planner = await getUserPlanner();

  planner.years
    .flatMap((x) => Object.values(x))
    .flat()
    .concat(planner.unplanned)
    .forEach(async (id) => {
      const res = await axios.get<Course>(`courses/getCourse/${id}`);
      courses[id] = res.data;
    });

  return courses;
};
