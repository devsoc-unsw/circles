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

export type CoursesResponse = Record<string, CourseResponse>;

export type CourseResponse = {
  code: string;
  suppress: boolean;
  mark: number;
};

export type PlannerResponse = {
  mostRecentPastTerm: Term;
  unplanned: string[];
  startYear: number;
  isSummerEnabled: boolean;
  // TODO: Type this better somehow
  years: Record<string, string[]>[];
  courses: Record<string, CourseResponse>;
};

export type Term = {
  Y: string;
  T: string;
};

// null coalesced to remove `undefined`. This SHOULD NOT see production
// temp fix while we wait for `prepareUserPayload` to be deprecated
export const badPlanner = {
  mostRecentPastTerm: { Y: '2020', T: '2' },
  unplanned: [],
  startYear: 2021,
  isSummerEnabled: false,
  years: {} as Record<string, string[]>[],
  courses: {} as Record<string, CourseResponse>
} as PlannerResponse;
