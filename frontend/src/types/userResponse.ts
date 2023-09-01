import { Mark } from './planner';

export type UserResponse = {
  degree: DegreeResponse;
  // TODO: NOT STRINGS
  planner: PlannerResponse;
  courses: Record<string, CourseResponse>;
};

export type DegreeResponse = {
  programCode: string;
  specs: string[];
  isComplete: boolean;
};

export type CourseResponse = {
  code: string;
  suppress: boolean;
  mark: Mark;
};

export type CoursesResponse = Record<string, CourseResponse>;

export type PlannerResponse = {
  mostRecentPastTerm: Term;
  unplanned: string[];
  startYear: number;
  isSummerEnabled: boolean;
  lockedTerms: Record<string, boolean>;
  // TODO: Type this better somehow
  years: Record<string, string[]>[];
  courses: Record<string, CourseResponse>;
};

export type Term = {
  y: string;
  t: string;
};

// null coalesced to remove `undefined`. This SHOULD NOT see production
// temp fix while we wait for `prepareUserPayload` to be deprecated
export const badPlanner = {
  mostRecentPastTerm: { y: '2020', t: '2' },
  unplanned: [],
  startYear: 2021,
  isSummerEnabled: false,
  lockedTerms: {},
  years: [],
  courses: {} as Record<string, CourseResponse>
} as PlannerResponse;

export const badCourses = {};
