// Planner courses + the backend's course details → the evaluator's catalogue (SCHEMA.md §7.1).
//
// The backend's /courses/getCourse already has gen-ed, faculty, school and equivalents for every
// course. The documents name faculties and schools by short codes (faculty:ENG, school:CSE) that
// their library documents map to full names, so a course's faculty and school are matched to those
// codes by name. Until the backend exports the catalogue (EVALUATOR.md §9 Q1), this is the source.
import type { CatalogueData, CourseFacts, SourceFile } from '@circles/degree-eval';
import { parseYaml } from '@circles/degree-eval';
import { Course } from 'types/api';
import { CoursesResponse } from 'types/userResponse';

// The fields of /courses/getCourse the catalogue uses.
export type CourseDetails = Pick<Course, 'code' | 'school' | 'study_level'> &
  Partial<Pick<Course, 'faculty' | 'gen_ed' | 'equivalents'>>;

export type OrgCodes = { faculties: Map<string, string>; schools: Map<string, string> };

// "Faculty of Law & Justice" and "Faculty of Law and Justice" are the same org
const normalise = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

// name → code for every faculty and school the library documents list (any year)
export const orgCodes = (files: SourceFile[]): OrgCodes => {
  const codes: OrgCodes = { faculties: new Map(), schools: new Map() };
  files
    .filter((f) => /(^|\/)library[^/]*\.ya?ml$/.test(f.path))
    .forEach((f) => {
      let doc: unknown;
      try {
        doc = parseYaml(f.text);
      } catch {
        return; // reported by the evaluator's own load
      }
      if (!isObj(doc)) return;
      (['faculties', 'schools'] as const).forEach((kind) => {
        const orgs = doc[kind];
        if (!isObj(orgs)) return;
        Object.entries(orgs).forEach(([code, org]) => {
          if (isObj(org) && typeof org.name === 'string') {
            codes[kind].set(normalise(org.name), code);
          }
        });
      });
    });
  return codes;
};

const CAREERS: Record<string, string> = {
  undergraduate: 'ugrd',
  postgraduate: 'pgrd',
  research: 'rsch'
};

export const toCatalogue = (
  courses: CoursesResponse,
  details: Record<string, CourseDetails | undefined> = {},
  orgs: OrgCodes = { faculties: new Map(), schools: new Map() }
): CatalogueData => ({
  courses: Object.values(courses).map((c): CourseFacts => {
    const d = details[c.code];
    if (!d) return { code: c.code, uoc: c.uoc };
    const faculty = d.faculty ? orgs.faculties.get(normalise(d.faculty)) : undefined;
    const school = d.school ? orgs.schools.get(normalise(d.school)) : undefined;
    const career = CAREERS[d.study_level?.toLowerCase() ?? ''];
    return {
      code: c.code,
      uoc: c.uoc,
      ...(career ? { career } : {}),
      ...(faculty ? { faculty } : {}),
      ...(school ? { school } : {}),
      ...(d.gen_ed === undefined ? {} : { gen_ed: d.gen_ed }),
      ...(d.equivalents ? { equivalents: Object.keys(d.equivalents) } : {})
    };
  })
});
