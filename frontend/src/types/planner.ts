export type Term = 'T0' | 'T1' | 'T2' | 'T3';

export type Mark = number | Grade | undefined;

export type Grade = 'SY' | 'FL' | 'PS' | 'CR' | 'DN' | 'HD';

export type CourseLegacyOfferings = {
  [year: string]: Term[];
};

export type PlannerCourse = {
  title: string;
  termsOffered: Term[];
  UOC: number;
  plannedFor: string | null;
  prereqs: string;
  isLegacy: boolean;
  isUnlocked: boolean;
  warnings: string[];
  handbookNote: string;
  isAccurate: boolean;
  supressed: boolean;
  isMultiterm: boolean;
  mark: Mark;
  legacyOfferings?: CourseLegacyOfferings;
};

export type PlannerYear = {
  T0: string[];
  T1: string[];
  T2: string[];
  T3: string[];
};

export type JSONPlanner = {
  startYear: number;
  numYears: number;
  isSummerEnabled: boolean;
  years: PlannerYear[];
  version: number;
};
