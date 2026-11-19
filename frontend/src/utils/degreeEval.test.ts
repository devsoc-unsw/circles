import { loadDocuments, parseCondition, SCHEMA_VERSION } from '@circles/degree-eval';

const PROGRAM = `schema_version: "1.0"
kind: program
code: "9999"
year: 2026
provenance: { source: hand }
title: Test program
uoc: 6
requirements:
  - { id: core, kind: core, courses: [COMP1511] }
`;

describe('@circles/degree-eval', () => {
  it('resolves the package', () => {
    expect(SCHEMA_VERSION).toEqual('1.0');
  });

  it('parses a compact condition', () => {
    expect(parseCondition('COMP1511 and COMP1521')).toEqual({ and: ['COMP1511', 'COMP1521'] });
  });

  it('loads and validates a YAML document', () => {
    const { docs, diagnostics } = loadDocuments([
      { path: 'p.yaml', text: PROGRAM, origin: 'repo' }
    ]);
    expect(diagnostics).toEqual([]);
    expect(docs.map((d) => d.kind)).toEqual(['program']);
  });
});
