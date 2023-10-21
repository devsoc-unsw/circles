import { Course } from './api';
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
};

export type Term = {
  y: string;
  t: string;
};

// null coalesced to remove `undefined`. This SHOULD NOT see production
// temp fix while we wait for `prepareUserPayload` to be deprecated
export const badPlanner: PlannerResponse = {
  mostRecentPastTerm: { y: '2020', t: '2' },
  unplanned: [],
  startYear: 2021,
  isSummerEnabled: false,
  lockedTerms: {},
  years: []
};

export const badCourseInfo: Course = {
  title: '',
  code: '',
  UOC: 0,
  description: '',
  study_level: '',
  school: '',
  campus: '',
  raw_requirements: '',
  terms: [],
  is_legacy: false,
  is_accurate: false,
  is_multiterm: false,
  handbook_note: ''
};

export const badCourses = {};
