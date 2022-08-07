import { CourseStates } from './courses';
import { ProgramStructure } from './structure';

export type ValidateTermPlanner = {
  course_state: CourseStates
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
  courses: string[]
};
