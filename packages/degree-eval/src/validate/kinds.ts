/* eslint-disable import/extensions -- ./generated/validators is a generated .js with a .d.ts beside it */
import type { Validator } from './generated/validators';
import {
  validate_course_conditions as validateCourseConditions,
  validate_library as validateLibrary,
  validate_patch as validatePatch,
  validate_program as validateProgram,
  validate_specialisation as validateSpecialisation
} from './generated/validators';

export type DocKind = 'program' | 'specialisation' | 'course_conditions' | 'patch' | 'library';

export const DOC_KINDS: readonly DocKind[] = [
  'program',
  'specialisation',
  'course_conditions',
  'patch',
  'library'
];

// one validator per document kind, so errors from the other kinds' branches are not reported
export const KIND_VALIDATORS: Readonly<Record<DocKind, Validator>> = {
  program: validateProgram,
  specialisation: validateSpecialisation,
  course_conditions: validateCourseConditions,
  patch: validatePatch,
  library: validateLibrary
};
