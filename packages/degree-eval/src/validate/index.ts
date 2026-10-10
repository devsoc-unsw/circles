/* eslint-disable import/extensions -- ./generated/validators is a generated .js with a .d.ts beside it */
import type { SchemaError, Validator } from './generated/validators';
import {
  validate_course_conditions as validateCourseConditions,
  validate_library as validateLibrary,
  validate_patch as validatePatch,
  validate_program as validateProgram,
  validate_specialisation as validateSpecialisation,
  validateDoc,
  validateFixture
} from './generated/validators';

export type { SchemaError } from './generated/validators';
export { SCHEMA_SHA256 } from './generated/validators';

export type DocKind = 'program' | 'specialisation' | 'course_conditions' | 'patch' | 'library';

export const DOC_KINDS: readonly DocKind[] = [
  'program',
  'specialisation',
  'course_conditions',
  'patch',
  'library'
];

const KIND_VALIDATORS: Record<DocKind, Validator> = {
  program: validateProgram,
  specialisation: validateSpecialisation,
  course_conditions: validateCourseConditions,
  patch: validatePatch,
  library: validateLibrary
};

// validate.mjs schemaMsgs: the first 8 errors that are not oneOf/if/anyOf bookkeeping,
// `${instancePath} ${message}` plus the offending property, de-duplicated, joined by "; ".
export const schemaMessages = (errors: readonly SchemaError[]): string =>
  [
    ...new Set(
      errors
        .filter((e) => !/oneOf|if|anyOf/.test(e.keyword))
        .slice(0, 8)
        .map((e) => {
          const extra = e.params.additionalProperty;
          return `${e.instancePath} ${e.message ?? ''}${typeof extra === 'string' ? ` (${extra})` : ''}`;
        })
    )
  ].join('; ');

const kindOf = (d: unknown): unknown =>
  d && typeof d === 'object' ? (d as { kind?: unknown }).kind : undefined;

// null when valid. Otherwise the errors of the document's own kind, so errors from the other
// branches of the top-level oneOf are not reported (validate.mjs checkSchema).
export const checkDocumentSchema = (d: unknown): string | null => {
  if (validateDoc(d)) return null;
  const kind = kindOf(d);
  const v =
    typeof kind === 'string' && Object.hasOwn(KIND_VALIDATORS, kind)
      ? KIND_VALIDATORS[kind as DocKind]
      : undefined;
  if (v && !v(d)) return schemaMessages(v.errors ?? []);
  return schemaMessages(validateDoc.errors ?? []);
};

// Conformance fixture shape (SCHEMA.md §15); null when valid.
export const checkFixtureSchema = (fx: unknown): string | null =>
  validateFixture(fx) ? null : schemaMessages(validateFixture.errors ?? []);
