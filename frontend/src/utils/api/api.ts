import axios from 'axios';
import { CourseCode } from './commonTypes';
import {
  APICourseCodes,
  APICourseDetails,
  APICoursesPath,
  APICoursesState,
  APICoursesUnlockedWhenTaken,
  APIProgramCourses,
  APIPrograms,
  APIStructure,
  APITermsList,
  APIValidCoursesState
} from './responseTypes';

// TODO: make error unwrapping functions

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

interface ProgramsEndpoints {
  all: () => Promise<APIPrograms>;
  structure: (programCode: string, spec?: string) => Promise<APIStructure>;
}

type APIEndpoints = {
  planner: PlannerEndpoints;
  courses: CoursesEndpoints;
  programs: ProgramsEndpoints;
};

const API: APIEndpoints = {
  planner: {
    validate: (plannerData) => axios.post('/planner/validateTermPlanner', plannerData)
  }
};

export default API;
