import { CourseList, CourseStates, CourseValidation } from './courses';
import { ProgramStructure } from './structure';

export type ValidateTermPlanner = {
  courses_state: CourseStates
};

export type Structure = {
  structure: ProgramStructure,
  uoc: number
};

export type Specialisations = {
  spec: {
    [specKey: string]: {
      is_optional?: boolean
      notes: string
      specs: Record<string, string>
    }
  }
};

export type SpecialisationTypes = {
  types: string[]
};

export type Programs = {
  programs: Record<string, string>
};

export type SearchCourse = Record<string, string>;

export type UnselectCourses = {
  courses: CourseList
};

export type CoursesUnlockedWhenTaken = {
  direct_unlock: CourseList
  indirect_unlock: CourseList
};

export type CourseChildren = {
  original: string
  courses: CourseList
};

export type StructureCourseList = {
  courses: CourseList
};

type CourseEdge = {
  source: string
  target: string
};

export type GraphPayload = {
  edges: CourseEdge[]
  courses: CourseList
};

export type CoursePathFrom = {
  original: string
  courses: CourseList
};

export type CoursesAllUnlocked = {
  courses_state: Record<string, CourseValidation>
};

// TODO: Add CourseDetail here?
