import axios from 'axios';
import { Course } from 'types/api';
import { getUserPlanner } from './userApi';

export const getCoursesInfo = async (courseIds: string[]): Promise<Record<string, Course>> => {
  const courses: Record<string, Course> = {};

  courseIds.forEach(async (id) => {
    const res = await axios.get<Course>(`course/getCourse/${id}`);
    courses[id] = res.data;
  });

  return courses;
};

export const getCoursesPlannedFor = async (): Promise<Record<string, string>> => {
  const planner = await getUserPlanner();
  const res: Record<string, string> = {};

  planner.years.forEach((year) => {
    Object.entries(year).forEach((term) => {
      const [termName, courses] = term;
      courses.forEach((course) => {
        [res[course]] = termName;
      });
    });
  });

  return res;
};
