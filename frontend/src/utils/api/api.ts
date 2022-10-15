import axios from 'axios';
import { CourseCode } from './commonTypes';
import {
  APICourseCodes,
  APICourseDetails,
  APICoursesPath,
  APICoursesState,
  APICoursesUnlockedWhenTaken,
  APIProgramCourses,
  APITermsList,
  APIValidCoursesState
} from './responseTypes';

// TODO: handle errors
async function get<T>(url: string): Promise<T> {
  const res = await axios.get<T>(url);
  if (res.status !== 200) {
    throw Error('TODO');
  }

  return res.data;
}

async function post<T>(url: string, data?: unknown): Promise<T> {
  const res = await axios.post<T>(url, data);
  if (res.status !== 200) {
    throw Error('TODO');
  }

  return res.data;
}

interface PlannerEndpoints {
  validate: (plannerData?: APIPlannerData) => Promise<APIValidCoursesState>;
}

interface CoursesEndpoints {
  jsonified: (courseCode: CourseCode) => Promise<string>;
  course: (courseCode: CourseCode) => Promise<APICourseDetails>;
  search: (searchString: string, userData: APIUserData) => Promise<{ [code: CourseCode]: string }>;
  allUnlocked: (userData: APIUserData) => Promise<APICoursesState>;
  legacyCourses: (year: string, term: string) => Promise<APIProgramCourses>;
  legacyCourse: (year: string, courseCode: CourseCode) => Promise<APICourseDetails>;
  unselect: (courseCode: CourseCode, userData: APIUserData) => Promise<APICourseCodes>;
  children: (courseCode: CourseCode) => Promise<APICoursesPath>;
  pathFrom: (courseCode: CourseCode) => Promise<APICoursesPath>;
  unlockedWhenTaken: (
    courseCode: CourseCode,
    userData: APIUserData
  ) => Promise<APICoursesUnlockedWhenTaken>;
  termsOffered: (courseCode: CourseCode, years: string[]) => Promise<APITermsList>;
}

type APIEndpoints = {
  planner: PlannerEndpoints;
  courses: CoursesEndpoints;
};

const API: APIEndpoints = {
  planner: {
    validate: (plannerData) => post('/planner/validateTermPlanner', plannerData)
  }
};

export default API;
