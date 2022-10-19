import { AxiosResponse } from 'axios';
import { CourseCode } from './commonTypes';
import { APIPlannerData, APIUserData } from './requestTypes';
import {
  APICourseCodes,
  APICourseDetails,
  APICourses,
  APICoursesPath,
  APICoursesState,
  APICoursesUnlockedWhenTaken,
  APIGraph,
  APIProgramCourses,
  APIPrograms,
  APISpecialisations,
  APISpecialisationTypes,
  APIStructure,
  APITermsList,
  APIValidCoursesState
} from './responseTypes';

interface PlannerEndpoints {
  validate: (plannerData: APIPlannerData) => Promise<AxiosResponse<APIValidCoursesState>>;
}

interface CoursesEndpoints {
  jsonified: (courseCode: CourseCode) => Promise<AxiosResponse<string>>;
  course: (courseCode: CourseCode) => Promise<AxiosResponse<APICourseDetails>>;
  search: (searchString: string, userData: APIUserData) => Promise<AxiosResponse<{ [code: CourseCode]: string }>>;
  allUnlocked: (userData: APIUserData) => Promise<AxiosResponse<APICoursesState>>;
  legacyCourses: (year: string, term: string) => Promise<AxiosResponse<APIProgramCourses>>;
  legacyCourse: (year: string, courseCode: CourseCode) => Promise<AxiosResponse<APICourseDetails>>;
  unselect: (courseCode: CourseCode, userData: APIUserData) => Promise<AxiosResponse<APICourseCodes>>;
  children: (courseCode: CourseCode) => Promise<AxiosResponse<APICoursesPath>>;
  pathFrom: (courseCode: CourseCode) => Promise<AxiosResponse<APICoursesPath>>;
  unlockedWhenTaken: (
    courseCode: CourseCode,
    userData: APIUserData
  ) => Promise<AxiosResponse<APICoursesUnlockedWhenTaken>>;
  termsOffered: (courseCode: CourseCode, years: string[]) => Promise<AxiosResponse<APITermsList>>;
}

interface ProgramsEndpoints {
  all: () => Promise<AxiosResponse<APIPrograms>>;
  structure: (programCode: string, spec?: string) => Promise<AxiosResponse<APIStructure>>;
  courses: (programCode: string, spec?: string) => Promise<AxiosResponse<APICourseCodes>>;
  geneds: (programCode: string) => Promise<AxiosResponse<APICourses>>;
  graph: (programCode: string, spec?: string) => Promise<AxiosResponse<APIGraph>>;
  cores: (programCode: string, spec: string) => Promise<AxiosResponse<CourseCode[]>>;
}

interface SpecialisationsEndpoints {
  types: (programCode: string) => Promise<AxiosResponse<APISpecialisationTypes>>;
  specialisations: (programCode: string, type: string) => Promise<AxiosResponse<APISpecialisations>>;
}

interface DefaultEndpoints {
  liveYear: () => Promise<AxiosResponse<number>>;
}

export type APIEndpoints = {
  planner: PlannerEndpoints;
  courses: CoursesEndpoints;
  programs: ProgramsEndpoints;
  specialisations: SpecialisationsEndpoints;
  default: DefaultEndpoints
};