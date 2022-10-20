import {
  APICourseDetails,
  APICoursesPath,
  APICoursesUnlockedWhenTaken,
  APIGraph,
  APIGraphEdge,
  APIPrograms,
  APISearch,
  APISpecialisations,
  APISpecialisationTypes,
  APIStructure
} from 'utils/api/responseTypes';
import { CourseList, CourseStates, CourseValidation } from './courses';

// types are layed out from the BE api routes
// more info can be found on the /docs on the BE url
// https://circlesapi.csesoc.app/docs

/* Planner api */

export type ValidateTermPlanner = {
  courses_state: CourseStates;
};

/* Courses api */

export type Course = APICourseDetails;
// export type Course = {
//   title: string;
//   code: string;
//   UOC: number;
//   description: string;
//   study_level: string;
//   school: string;
//   campus: string;
//   raw_requirements: string;
//   terms: Term[];
//   is_legacy: boolean;
//   is_accurate: boolean;
//   is_multiterm: boolean;
//   handbook_note: string;
// };

export type SearchCourse = APISearch;
// export type SearchCourse = Record<string, string>;

export type CoursesAllUnlocked = {
  courses_state: Record<string, CourseValidation>;
};

export type UnselectCourses = {
  courses: CourseList;
};

export type CourseChildren = APICoursesPath;
// export type CourseChildren = {
//   original: string;
//   courses: CourseList;
// };

export type CoursePathFrom = APICoursesPath;
// export type CoursePathFrom = {
//   original: string;
//   courses: CourseList;
// };

export type CoursesUnlockedWhenTaken = APICoursesUnlockedWhenTaken;
// export type CoursesUnlockedWhenTaken = {
//   direct_unlock: CourseList;
//   indirect_unlock: CourseList;
// };

/* Programs api */
export type Programs = APIPrograms;
// export type Programs = {
//   programs: Record<string, string>;
// };

export type Structure = APIStructure;
// export type Structure = {
//   structure: ProgramStructure;
//   uoc: number;
// };

export type StructureCourseList = {
  courses: CourseList;
};

export type CourseEdge = APIGraphEdge;
// export type CourseEdge = {
//   source: string;
//   target: string;
// };

export type GraphPayload = APIGraph;
// export type GraphPayload = {
//   edges: CourseEdge[];
//   courses: CourseList;
// };

/* Specialisations api */

export type Specialisations = APISpecialisations;
// export type Specialisations = {
//   spec: {
//     [specKey: string]: {
//       is_optional?: boolean;
//       notes: string;
//       specs: Record<string, string>;
//     };
//   };
// };

export type SpecialisationTypes = APISpecialisationTypes;
// export type SpecialisationTypes = {
//   types: string[];
// };
