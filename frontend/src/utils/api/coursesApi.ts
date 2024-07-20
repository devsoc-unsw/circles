import axios from 'axios';
import { Course } from 'types/api';
import { getUserPlanner } from './userApi';

export const getCoursesInfo = async (token: string): Promise<Record<string, Course>> => {
  const courses: Record<string, Course> = {};
  const planner = await getUserPlanner(token);

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
