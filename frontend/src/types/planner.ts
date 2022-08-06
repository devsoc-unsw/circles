export type Term = "T0" | "T1" | "T2" | "T3";

export type Mark = number | Grade | null;

export type Grade = "SY" | "FL" | "PS" | "CR" | "DN" | "HD";

export type PlannerCourse = {
  title: string
  termsOffered: Term[]
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
  mark: Mark
};

export type PlannerYear = {
  T0: string[]
  T1: string[]
  T2: string[]
  T3: string[]
};
