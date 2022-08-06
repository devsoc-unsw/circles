import { Term } from "./planner";

export type CourseCodes = {
  [courseKey: string]: string
};

export type CourseDetail = {
  title: string
  code: string
  UOC: number
  description: string
  study_level: string
  school: string
  campus: string
  raw_requirements: string
  terms: Term[]
  is_legacy: boolean
  is_accurate: boolean
  is_multiterm: boolean
  handbook_note: string
};

export type CourseValidation = {
  is_accurate: boolean
  unlocked: boolean
  handbook_note: string
  warnings: string[]
};

export type CourseUnlocks = {
  direct_unlock: string[]
  indirect_unlock: string[]
};

export type CourseStates = {
  [courseKey: string]: {
    handbook_note: string
    is_accurate: boolean
    supressed: boolean
    unlocked: boolean
    warnings: string[]
  }
};
