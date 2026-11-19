// Readable schema errors: one sentence per problem, at the right place, without union noise.
import { describe, expect, it } from 'vitest';
import { explainDocument, formatDiagnostic, loadDocuments, parseYaml } from '../src';

const BROKEN = `schema_version: "1.0"
kind: program
code: "9999"
year: 2026
provenance: { source: hnd, url: "www.example.com" }
title: Test
uoc: "144"
requirments: []
requirements:
  - id: Core
    kind: core
    courses: [COMP151, "MATH1131 or MATH1141 and MATH1081"]
  - id: free
    kind: pool
    from: 12
  - id: gen
    kind: pol
  - id: g
    kind: group
    children:
      - { id: x, kind: check, require: { uoc: -1 } }
      - { id: y, kind: limit, from: { cours: COMP1511 }, uoc: { max: 12 } }
`;

const messages = (text: string) =>
  loadDocuments([{ path: 'p.yaml', text, origin: 'repo' }]).diagnostics.map(formatDiagnostic);

describe('readable schema errors', () => {
  it('reports each problem once, in plain words, with its line and column', () => {
    expect(messages(BROKEN)).toEqual([
      'p.yaml:8:1: requirments: unknown field "requirments" (did you mean "requirements"?)',
      'p.yaml:7:6: uoc: must be a whole number, but is text "144"',
      'p.yaml:5:23: provenance.source: "hnd" is not allowed; use one of "scraped", "hand", "patch", "local" (did you mean "hand"?)',
      'p.yaml:5:33: provenance.url: "www.example.com" is not a full web address starting with https://',
      'p.yaml:10:9: requirements[0].id: "Core" is not a node id: lowercase letters, digits and hyphens, like level-1-core',
      'p.yaml:12:15: requirements[0].courses[0]: "COMP151" is not a valid core item: a course code like COMP1511, or codes joined only by " or " or only by " and "',
      'p.yaml:12:24: requirements[0].courses[1]: "MATH1131 or MATH1141 and MATH1081" is not a valid core item: a course code like COMP1511, or codes joined only by " or " or only by " and "',
      'p.yaml:13:5: requirements[1]: needs at least one of "uoc" or "count"',
      'p.yaml:15:11: requirements[1].from: must be text, a list or a mapping (key: value lines), but is the number 12',
      'p.yaml:17:11: requirements[2].kind: unknown kind "pol" (did you mean "pool"?); use one of group, core, pool, spec, limit, maturity, timing, check, info',
      'p.yaml:21:47: requirements[3].children[0].require.uoc: must be at least 0, but is -1',
      'p.yaml:22:39: requirements[3].children[1].from.cours: unknown field "cours" (did you mean "course"?)'
    ]);
  });

  it('explains a conditional rule', () => {
    const doc = parseYaml(`schema_version: "1.0"
kind: course_conditions
year: 2026
provenance: { source: hand }
courses:
  COMP1511: { status: none, requires: COMP1911 }
`);
    expect(explainDocument(doc).map((i) => i.message)).toEqual([
      'courses.COMP1511.requires: field "requires" is not allowed when status is "none"'
    ]);
  });

  it('handles a document that is not a mapping, or has no or an unknown kind', () => {
    expect(explainDocument(['a']).map((i) => i.message)).toEqual([
      'document: must be a mapping (key: value lines), but is a list'
    ]);
    expect(explainDocument({ schema_version: '1.0' }).map((i) => i.message)).toEqual([
      'document: missing required field "kind" (one of program, specialisation, course_conditions, patch, library)'
    ]);
    expect(
      explainDocument({ schema_version: '1.0', kind: 'programme' }).map((i) => i.message)
    ).toEqual([
      'kind: unknown document kind "programme" (did you mean "program"?); use one of program, specialisation, course_conditions, patch, library'
    ]);
  });

  it('checks patch ops against the op they name', () => {
    const doc = parseYaml(`schema_version: "1.0"
kind: patch
id: fix-comp3900
target: { kind: program, code: "3778", years: 2026 }
provenance: { source: hand }
ops:
  - { op: list_add, target: core, field: courses }
  - { op: swap, target: core }
`);
    expect(explainDocument(doc).map((i) => i.message)).toEqual([
      'ops[0]: missing required field "items"',
      'ops[1].op: unknown op "swap"; use one of set, remove, replace, add, list_add, list_remove'
    ]);
  });

  it('does not repeat a schema error as a parse error', () => {
    const text = BROKEN.replace('COMP151, ', '');
    expect(messages(text).filter((m) => m.includes('courses[0]'))).toHaveLength(1);
    expect(messages(text).some((m) => m.includes('bad core item'))).toBe(false);
  });
});
