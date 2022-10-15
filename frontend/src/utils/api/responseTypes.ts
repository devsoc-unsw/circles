import { CourseCode, Optional, UOC } from './commonTypes';

type APIContainerContent = {
  UOC: UOC;
  courses: { [code: CourseCode]: string | string[] };
  type: string;
  notes: string;
};

export type APICourseCodes = {
  courses: string[];
};

export type APICourseDetails = {
  title: string;
  code: string;
  UOC: UOC;
  level: number;
  description: string;
  study_level: string;
  school: Optional<string>;
  campus: string;
  equivalents: { [code: CourseCode]: 1 }; // TODO: wrong type models.py
  raw_requirements: string;
  exclusions: { [code: CourseCode]: 1 };
  handbook_note: string;
  terms: string[];
  gen_ed: boolean;
  is_legacy: boolean;
  is_accurate: boolean;
  is_multiterm: Optional<string>;
};

type APICourseState = {
  is_accurate: boolean;
  unlocked: boolean;
  handbook_note: string;
  warnings: unknown[]; // TODO: possibly string[]
};

type APICourses = {
  courses: { [code: CourseCode]: string };
};

export type APICoursesPath = {
  original: string;
  courses: string[];
};

export type APICoursesState = {
  courses_state: { [code: CourseCode]: APICourseState };
};

export type APICoursesUnlockedWhenTaken = {
  direct_unlock: string[];
  indirect_unlock: string[];
};

type APIGraph = {
  edges: {
    source: CourseCode;
    target: CourseCode;
  }[];
  courses: CourseCode[];
};

type APIMostRecentPastTerm = {
  Y: number;
  T: number;
};

export type APIProgramCourses = {
  courses: { [code: CourseCode]: string };
};

type APIPrograms = {
  programs: { [code: string]: string };
};

type APISpecialisationTypes = {
  types: string[];
};

type APISpecialisations = {
  spec: {
    [program: string]: {
      is_optional: boolean;
      specs: { [spec: string]: string };
      notes: string;
    };
  };
};

type APIStructure = {
  structure: { [group: string]: APIStructureContainer };
  uoc: UOC;
};

type APIStructureContainer = {
  name: string;
  content: { [subgroup: string]: APIContainerContent };
};

export type APITermsList = {
  terms: { [year: string]: Optional<string[]> };
  fails: [string, string, unknown][];
};

type APIValidCourseState = {
  is_accurate: boolean;
  unlocked: boolean;
  handbook_note: string;
  warnings: string[];
  supressed: boolean;
};

export type APIValidCoursesState = {
  courses_state: { [code: CourseCode]: APIValidCourseState };
};
