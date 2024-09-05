import axios from 'axios';
import {
  Course,
  CourseChildren,
  CoursePathFrom,
  CoursesAllUnlocked,
  CoursesUnlockedWhenTaken,
  SearchCourse
} from 'types/api';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import prepareUserPayload from 'utils/prepareUserPayload';
import { LIVE_YEAR } from 'config/constants';
import { withAuthorization } from './authApi';

// TODO: Should error handling be done here?
export const searchCourse = async (token: string, query: string): Promise<SearchCourse> => {
  const res = await axios.post(
    `/courses/searchCourse/${query}`,
    {},
    { headers: withAuthorization(token) }
  );
  return res.data as SearchCourse;
};

export const getCourseInfo = async (courseCode: string) => {
  const res = await axios.get<Course>(`courses/getCourse/${courseCode}`);
  return res.data;
};

export const getCoursePrereqs = async (courseCode: string) => {
  const res = await axios.get<CoursePathFrom>(`/courses/getPathFrom/${courseCode}`);
  return res.data;
};

export const getCourseChildren = async (courseCode: string) => {
  const res = await axios.get<CourseChildren>(`/courses/courseChildren/${courseCode}`);
  return res.data;
};

export const getCoursesUnlockedWhenTaken = async (token: string, courseCode: string) => {
  const res = await axios.post<CoursesUnlockedWhenTaken>(
    `/courses/coursesUnlockedWhenTaken/${courseCode}`,
    {},
    {
      headers: withAuthorization(token)
    }
  );
  return res.data;
};

export const getAllUnlockedCourses = async (
  degree: DegreeResponse,
  planner: PlannerResponse,
  courses: CoursesResponse
) => {
  const res = await axios.post<CoursesAllUnlocked>(
    '/courses/getAllUnlocked/',
    JSON.stringify(prepareUserPayload(degree, planner, courses))
  );

  return res.data;
};

export const getCourseForYearsInfo = async (
  courseCode: string,
  years: number[]
): Promise<Record<number, Course>> => {
  const promises = await Promise.allSettled(
    years.map((year) => axios.get<Course>(`courses/getLegacyCourse/${year}/${courseCode}`))
  );
  const legacy: Record<number, Course> = {};
  promises.forEach((promise, index) => {
    if (promise.status === 'fulfilled') {
      legacy[years[index]] = promise.value.data;
    }
  });
  const current = await getCourseInfo(courseCode);
  legacy[LIVE_YEAR] = current;
  return legacy;
};
