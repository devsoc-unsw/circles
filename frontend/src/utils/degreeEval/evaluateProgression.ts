import type { Client, Diagnostic, Evaluation, SourceFile } from '@circles/degree-eval';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import { EvaluatedProgression, toProgressionView } from './adapter';
import { CourseDetails, orgCodes, toCatalogue } from './catalogue';
import { toStudent } from './student';

export type ProgressionResult = EvaluatedProgression & {
  unplacedSpecs: string[]; // specs the program's documents do not offer
  yearFallback: boolean; // no document for the start year; the nearest year was used
  diagnostics: Diagnostic[];
  unplannedCount: number; // courses in the Unplanned column, which count towards nothing
  equivalents: { code: string; item: string }[]; // core items met by an equivalent course
  undecided: string[]; // requirements left unknown by an overlap no share rule covers
};

const codeOf = (iid: string) => iid.replace(/#\d+$/, '');

// Core items met through a catalogue equivalent: the allocated course is not named in any item.
const equivalentsUsed = (ev: Evaluation) =>
  [...ev.nodes.values()]
    .filter((n) => n.kind === 'core' && !n.inactive)
    .flatMap((n) =>
      n.allocations
        .map((a) => codeOf(a.iid))
        .filter((code) => !(n.items ?? []).some((item) => item.includes(code)))
        .map((code) => ({ code, item: n.title ?? n.id }))
    );

const undecidedBy = (ev: Evaluation) =>
  [...ev.nodes.values()]
    .filter((n) => !n.inactive && n.reasons.some((r) => r.code === 'overlap_undeclared'))
    .map((n) => n.title ?? n.id);

// Load the documents with the student's catalogue facts, place their specs, evaluate and adapt.
export const evaluateProgression = async (
  client: Client,
  files: SourceFile[],
  degree: DegreeResponse,
  planner: PlannerResponse,
  courses: CoursesResponse,
  details: Record<string, CourseDetails | undefined> = {}
): Promise<ProgressionResult> => {
  const loaded = await client.load({
    files,
    catalogue: toCatalogue(courses, details, orgCodes(files))
  });
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
    diagnostics: [...loaded.diagnostics, ...ev.diagnostics],
    unplannedCount: planner.unplanned.length,
    equivalents: equivalentsUsed(ev),
    undecided: undecidedBy(ev)
  };
};
