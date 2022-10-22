import { CourseCode } from 'types/courses';
import { Optional, UOC } from './common';

// TODO: double check this with backend
export type APIUserSpecs = { [spec: string]: 1 };

// TODO: double check this with backend
export type APIUserCoursesAndMarks = { [course: CourseCode]: Optional<number> };

export type APIUserData = {
  program: string;
  specialisations: APIUserSpecs;
  courses: APIUserCoursesAndMarks;
};

type APIMostRecentPastTerm = {
  Y: number;
  T: number;
};

export type APITermPlan = {
  [code: CourseCode]: Optional<[UOC, Optional<number>]>; // number = mark
};

export type APIYearPlan = APITermPlan[];

export type APIPlannerData = {
  program: string;
  specialisations: string[];
  plan: APIYearPlan[];
  mostRecentPastTerm: APIMostRecentPastTerm;
};
