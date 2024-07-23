import axios from 'axios';
import { Course, CoursesAllUnlocked } from 'types/api';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import prepareUserPayload from 'utils/prepareUserPayload';
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

export const getAllUnlockedCourses = async (
  degree: DegreeResponse,
  planner: PlannerResponse,
  courses: CoursesResponse
): Promise<CoursesAllUnlocked> => {
  const res = await axios.post<CoursesAllUnlocked>(
    '/courses/getAllUnlocked/',
    JSON.stringify(prepareUserPayload(degree, planner, courses))
  );

  return res.data;
};
