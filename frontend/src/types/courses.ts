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
  terms: string[]
  is_legacy: boolean
  is_accurate: boolean
  is_multiterm: boolean
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

export type PlannerCourse = {
  title: string
  termsOffered: string[]
  UOC: number
  plannedFor: string
  prereqs: string
  isLegacy: boolean
  isUnlocked: boolean
  warnings: string[]
  handbookNote: string
  isAccurate: boolean
  supressed: boolean
  isMultiterm: boolean
  mark: boolean
};
