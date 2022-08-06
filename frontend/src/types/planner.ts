export type Term = "T0" | "T1" | "T2" | "T3";

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
  mark: boolean
};
