import type { Client, Diagnostic, SourceFile } from '@circles/degree-eval';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import { EvaluatedProgression, toProgressionView } from './adapter';
import { toCatalogue, toStudent } from './student';

export type ProgressionResult = EvaluatedProgression & {
  unplacedSpecs: string[]; // specs the program's documents do not offer
  yearFallback: boolean; // no document for the start year; the nearest year was used
  diagnostics: Diagnostic[];
};

// Load the documents with the student's catalogue facts, place their specs, evaluate and adapt.
export const evaluateProgression = async (
  client: Client,
  files: SourceFile[],
  degree: DegreeResponse,
  planner: PlannerResponse,
  courses: CoursesResponse
): Promise<ProgressionResult> => {
  const loaded = await client.load({ files, catalogue: toCatalogue(courses) });
  const { selections, unplaced } = await client.assignSpecs({
    program: degree.programCode,
    year: planner.startYear,
    codes: degree.specs
  });
  const ev = await client.evaluate({
    student: toStudent(degree.programCode, planner, courses, selections)
  });
  return {
    ...toProgressionView(ev, courses, planner.unplanned),
    unplacedSpecs: unplaced,
    yearFallback: ev.program.yearFallback,
    diagnostics: [...loaded.diagnostics, ...ev.diagnostics]
  };
};
