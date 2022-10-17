import { Optional, UOC } from './commonTypes';

export type APIUserData = {
  program: string;
  specialisations: unknown;
  courses: unknown;
};

type APIMostRecentPastTerm = {
  Y: number;
  T: number;
};

export type APIPlannerData = {
  program: string;
  specialisations: string[];
  plan: { [code: string]: Optional<[UOC, Optional<number>]> }[][]; // List of years, that are a list of terms
  mostRecentPastTerm: APIMostRecentPastTerm;
};
