import { CourseCode, Optional, UOC } from './commonTypes';

export type APIUserData = {
  program: string;
  specialisations: { [spec: string]: 1 }; // TODO: double check this with backend
  courses: { [course: CourseCode]: Optional<number> }; // TODO: double check this with backend
};

type APIMostRecentPastTerm = {
  Y: number;
  T: number;
};

type APITermPlan = {
  [code: CourseCode]: Optional<[UOC, Optional<number>]>; // number = mark
};

type APIYearPlan = APITermPlan[];

export type APIPlannerData = {
  program: string;
  specialisations: string[];
  plan: APIYearPlan[];
  mostRecentPastTerm: APIMostRecentPastTerm;
};
