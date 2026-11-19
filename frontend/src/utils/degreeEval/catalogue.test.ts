import loadExampleDocuments from 'test/exampleDegreeDocuments';
import { describe, expect, it } from 'vitest';
import { orgCodes, toCatalogue } from './catalogue';

const course = (code: string) => ({
  code,
  title: code,
  uoc: 6,
  mark: null,
  plannedFor: '',
  isMultiterm: false,
  ignoreFromProgression: false
});

describe('catalogue from course details', () => {
  it("matches the backend's org names to the library's codes", async () => {
    const orgs = orgCodes(await loadExampleDocuments());
    // the backend writes "and" and "&" where the handbook library has the other
    expect(orgs.faculties.get('faculty of law and justice')).toBe('LAW');
    expect(orgs.faculties.get('faculty of arts design and architecture')).toBe('ADA');
    expect(orgs.schools.get('school of mathematics and statistics')).toBe('MATHS');
  });

  it('carries gen-ed, faculty, school, career and equivalents', async () => {
    const orgs = orgCodes(await loadExampleDocuments());
    const courses = { COMP1511: course('COMP1511'), GENL1062: course('GENL1062') };
    const catalogue = toCatalogue(
      courses,
      {
        COMP1511: {
          code: 'COMP1511',
          study_level: 'Undergraduate',
          faculty: 'Faculty of Engineering',
          school: 'School of Computer Science and Engineering',
          gen_ed: false,
          equivalents: { DPST1091: 1 }
        },
        GENL1062: {
          code: 'GENL1062',
          study_level: 'Undergraduate',
          faculty: 'Faculty of Law and Justice',
          school: 'School of Law, Society and Criminology', // not in the library: no school code
          gen_ed: true,
          equivalents: {}
        }
      },
      orgs
    );
    expect(catalogue.courses).toEqual([
      {
        code: 'COMP1511',
        uoc: 6,
        career: 'ugrd',
        faculty: 'ENG',
        school: 'CSE',
        gen_ed: false,
        equivalents: ['DPST1091']
      },
      { code: 'GENL1062', uoc: 6, career: 'ugrd', faculty: 'LAW', gen_ed: true, equivalents: [] }
    ]);
  });

  it('keeps only the UOC of a course whose details did not load', () => {
    const catalogue = toCatalogue({ COMP1511: course('COMP1511') });
    expect(catalogue.courses).toEqual([{ code: 'COMP1511', uoc: 6 }]);
  });
});
