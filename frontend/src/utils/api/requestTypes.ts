import { CourseCode, Optional, UOC } from './commonTypes';

export type APIUserData = {
  program: string;
  specialisations: unknown;
  courses: unknown;
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
