// The unit table of SPEC-M0-M1.md (rows 1–30). S = selector, I = core item, P = node path,
// N = normalize; unmarked rows are conditions.
import { describe, expect, it } from 'vitest';
import type { ParseErrorCode } from '../../src';
import {
  analyzeCondition,
  analyzeSelector,
  conditionToCompact,
  formatParseError,
  normalizeCondition,
  normalizeSelector,
  parseCondition,
  parseCoreItem,
  ParseError,
  parseNodePath,
  parseSelector,
  printCondition,
  printCoreItem,
  printNodePath,
  printSelector,
  selectorToCompact
} from '../../src';

const errorOf = (f: () => unknown): ParseError => {
  try {
    f();
  } catch (e) {
    if (e instanceof ParseError) return e;
    throw e;
  }
  throw new Error('expected a ParseError');
};

const expectCode = (f: () => unknown, code: ParseErrorCode) => expect(errorOf(f).code).toBe(code);

const spanOf = (src: string, needle: string, from = 0) => {
  const start = src.indexOf(needle, from);
  return { start, end: start + needle.length };
};

const reprint = (src: string) => printCondition(parseCondition(src));

describe('conditions and selectors parse to canonical ASTs', () => {
  it('1-2: flattens a parenthesised same-op operand (P1)', () => {
    const flat = { and: ['COMP1511', 'COMP1521', 'COMP1531'] };
    expect(parseCondition('(COMP1511 and COMP1521) and COMP1531')).toEqual(flat);
    expect(parseCondition('COMP1511 and (COMP1521 and COMP1531)')).toEqual(flat);
  });

  it('3: S flattens or', () => {
    expect(parseSelector('(COMP1511 or COMP1521) or COMP1531')).toEqual({
      or: ['COMP1511', 'COMP1521', 'COMP1531']
    });
  });

  it('4: keeps a different-op operand and prints it back identically', () => {
    const src = '(COMP1511 or COMP1521) and COMP1531';
    expect(parseCondition(src)).toEqual({ and: [{ or: ['COMP1511', 'COMP1521'] }, 'COMP1531'] });
    expect(reprint(src)).toBe(src);
  });

  it('5: drops redundant parentheses; keeps not not', () => {
    expect(parseCondition('((COMP1511))')).toBe('COMP1511');
    expect(parseCondition('not not COMP1511')).toEqual({ not: { not: 'COMP1511' } });
    expect(reprint('not not COMP1511')).toBe('not not COMP1511');
  });

  it('6: parenthesises an and/or operand of not', () => {
    expect(reprint('not (COMP1511 and COMP1521)')).toBe('not (COMP1511 and COMP1521)');
  });

  it('7: prints canonically (spacing, numbers)', () => {
    expect(reprint('coreq (COMP1511)')).toBe('coreq(COMP1511)');
    expect(reprint('uoc(018)')).toBe('uoc(18)');
    expect(reprint('wam(65.0, level:3)')).toBe('wam(65, level:3)');
  });

  it('8: grade takes {course} for a bare course, else {in}', () => {
    expect(parseCondition('grade(65, (MATH1231))')).toEqual({
      grade: { min: 65, course: 'MATH1231' }
    });
    expect(parseCondition('grade(65, MATH1231 or MATH1241)')).toEqual({
      grade: { min: 65, in: { or: ['MATH1231', 'MATH1241'] } }
    });
  });

  it('9: cores, complete, reported_wam', () => {
    expect(parseCondition('cores()')).toEqual({ cores: true });
    const complete = analyzeCondition('complete(major/COMPA1/core)');
    expect(complete.ast).toEqual({ complete: 'major/COMPA1/core' });
    expect(complete.refs).toEqual([
      { kind: 'node', name: 'major/COMPA1/core', span: { start: 9, end: 26 } }
    ]);
    expect(parseCondition('reported_wam(65, prior_program)')).toEqual({
      reported_wam: { min: 65, label: 'prior_program' }
    });
  });

  it('10: program/spec take string arrays and collect group refs with spans', () => {
    const p = 'program(3778, @bcom)';
    expect(analyzeCondition(p)).toEqual({
      ast: { program: ['3778', '@bcom'] },
      refs: [{ kind: 'program_group', name: 'bcom', span: spanOf(p, '@bcom') }],
      warnings: []
    });
    const s = 'spec(COMP*1, COMPBH, @g)';
    expect(analyzeCondition(s)).toEqual({
      ast: { spec: ['COMP*1', 'COMPBH', '@g'] },
      refs: [{ kind: 'spec_group', name: 'g', span: spanOf(s, '@g') }],
      warnings: []
    });
  });

  it('11: manual strings and booleans', () => {
    expect(parseCondition('manual("a \\"b\\" c")')).toEqual({ manual: 'a "b" c' });
    expect(reprint('manual("a \\"b\\" c")')).toBe('manual("a \\"b\\" c")');
    expect(parseCondition('true and false')).toEqual({ and: [true, false] });
  });

  it('12: S selector atoms and refs', () => {
    expect(parseSelector('gened and not (MATH**** or DATA****)')).toEqual({
      and: [{ gened: true }, { not: { or: [{ pattern: 'MATH****' }, { pattern: 'DATA****' }] } }]
    });
    const inSrc = 'in:spec:COMPA1/core';
    expect(analyzeSelector(inSrc)).toEqual({
      ast: { in: 'spec:COMPA1/core' },
      refs: [{ kind: 'in', name: 'spec:COMPA1/core', span: { start: 0, end: inSrc.length } }],
      warnings: []
    });
    expect(analyzeSelector('@x')).toEqual({
      ast: { set: 'x' },
      refs: [{ kind: 'set', name: 'x', span: { start: 0, end: 2 } }],
      warnings: []
    });
    expect(analyzeSelector('faculty:ENG and school:CSE').refs.map((r) => r.kind)).toEqual([
      'faculty',
      'school'
    ]);
  });
});

describe('errors', () => {
  it('13: empty input', () => {
    expectCode(() => parseCondition(''), 'UNEXPECTED_END');
    expectCode(() => parseCondition('   '), 'UNEXPECTED_END');
    expect(errorOf(() => parseSelector('')).message).toBe('unexpected end of selector');
  });

  it('14: mixed and/or, span on the second operator', () => {
    const e = errorOf(() => parseCondition('COMP1511 and COMP1521 or COMP1531'));
    expect(e.code).toBe('MIXED_AND_OR');
    expect(e.span).toEqual({ start: 22, end: 24 });
    expect(e.message).toBe('mixed "and"/"or" at one level near "or"; add parentheses');
  });

  it('15: unexpected character points at the character, not the space before it (P4)', () => {
    const e = errorOf(() => parseCondition('COMP1511 & COMP1521'));
    expect(e.code).toBe('UNEXPECTED_CHAR');
    expect(e.span).toEqual({ start: 9, end: 10 });
    expect(e.message).toBe('unexpected character at 9: "& COMP1521"');
    expect(formatParseError(e)).toBe(
      'unexpected character at 9: "& COMP1521" (col 10)\nCOMP1511 & COMP1521\n         ^'
    );
  });

  it('16: typed string errors (P5)', () => {
    const e = errorOf(() => parseCondition('manual("abc)'));
    expect(e.code).toBe('UNTERMINATED_STRING');
    expect(e.span).toEqual({ start: 7, end: 12 });
    expectCode(() => parseCondition('manual("a\\qb")'), 'BAD_STRING');
  });

  it('17: unknown atoms', () => {
    expectCode(() => parseCondition('TRUE'), 'UNKNOWN_ATOM');
    expectCode(() => parseCondition('COMP1511and COMP1521'), 'UNKNOWN_ATOM');
    expectCode(() => parseSelector('uoc(12,)'), 'UNKNOWN_ATOM');
  });

  it('18: unknown function; lenient mode turns it into manual (P7)', () => {
    const e = errorOf(() => parseCondition('foo(1)'));
    expect(e.code).toBe('UNKNOWN_FUNCTION');
    expect(e.span).toEqual({ start: 0, end: 6 });
    expect(analyzeCondition('foo(1)', { lenient: true })).toEqual({
      ast: { manual: 'foo(1)' },
      refs: [],
      warnings: [
        {
          code: 'LENIENT_UNKNOWN_ATOM',
          message: 'unknown function "foo"',
          span: { start: 0, end: 6 }
        }
      ]
    });
    expect(parseCondition('COMP1511 and newatom', { lenient: true })).toEqual({
      manual: 'COMP1511 and newatom'
    });
    // only condition-level unknowns are lenient; every other error still throws
    expectCode(() => parseCondition('uoc(6, newsel:1)', { lenient: true }), 'UNKNOWN_ATOM');
    expectCode(() => parseCondition('wam(101)', { lenient: true }), 'MARK_OUT_OF_RANGE');
  });

  it('19: marks above 100', () => {
    expectCode(() => parseCondition('wam(100.5)'), 'MARK_OUT_OF_RANGE');
    expect(errorOf(() => parseCondition('wam(999)')).message).toBe('wam() mark 999 is above 100');
    expectCode(() => parseCondition('grade(120, COMP1511)'), 'MARK_OUT_OF_RANGE');
    expect(parseCondition('wam(100)')).toEqual({ wam: { min: 100 } });
  });

  it('20: bad arguments', () => {
    expectCode(() => parseCondition('uoc(1.5)'), 'BAD_ARGUMENT');
    expectCode(() => parseCondition('spec(COMPA)'), 'BAD_ARGUMENT');
    expectCode(() => parseCondition('program()'), 'BAD_ARGUMENT');
    expectCode(() => parseCondition('reported_wam(65, Prior)'), 'BAD_ARGUMENT');
    expectCode(() => parseCondition('manual(COMP1511)'), 'BAD_ARGUMENT');
  });

  it('21: expected token / trailing input', () => {
    const e = errorOf(() => parseCondition('reported_wam(65)'));
    expect(e.code).toBe('EXPECTED_TOKEN');
    expect(e.message).toBe('expected "," but got ")"');
    const t = errorOf(() => parseCondition('COMP1511 COMP1521'));
    expect(t.code).toBe('TRAILING_INPUT');
    expect(t.span).toEqual({ start: 9, end: 17 });
  });

  it('22: in: inside cores()', () => {
    expectCode(() => parseCondition('cores(in:major)'), 'IN_INSIDE_CORES');
    const e = errorOf(() => parseCondition('cores(not in:major)'));
    expect(e.code).toBe('IN_INSIDE_CORES');
    expect(e.span).toEqual({ start: 10, end: 18 });
  });

  it('23: bad node paths', () => {
    expectCode(() => parseCondition('complete(Major)'), 'BAD_NODE_PATH');
    expectCode(() => parseSelector('in:Major'), 'BAD_NODE_PATH');
    expectCode(() => parseNodePath('COMPA1/core'), 'BAD_NODE_PATH');
  });

  it('24: bad selector values', () => {
    expectCode(() => parseSelector('level:10'), 'BAD_SELECTOR_VALUE');
    expectCode(() => parseSelector('career:ug'), 'BAD_SELECTOR_VALUE');
  });

  it('in: and @set refs parse cleanly; context checks are M8', () => {
    expect(parseSelector('in:a')).toEqual({ in: 'a' });
    expect(parseSelector('@nope')).toEqual({ set: 'nope' });
  });
});

describe('node paths and core items', () => {
  it('25: P typed node paths print back identically', () => {
    expect(parseNodePath('root')).toEqual({ form: 'root' });
    expect(parseNodePath('spec:ACCTA1/core')).toEqual({
      form: 'spec',
      spec: 'ACCTA1',
      ids: ['core']
    });
    expect(parseNodePath('eng/major/COMPBH/level-1-core')).toEqual({
      form: 'rel',
      segments: [{ id: 'eng' }, { id: 'major' }, { spec: 'COMPBH' }, { id: 'level-1-core' }]
    });
    expect(parseNodePath('major/thesis')).toEqual({
      form: 'rel',
      segments: [{ id: 'major' }, { id: 'thesis' }]
    });
    for (const p of ['root', 'spec:ACCTA1', 'spec:ACCTA1/core', 'eng/major/COMPBH/level-1-core']) {
      expect(printNodePath(parseNodePath(p))).toBe(p);
    }
  });

  it('26: I core items', () => {
    expect(parseCoreItem('COMP1511 or COMP1521')).toEqual({ or: ['COMP1511', 'COMP1521'] });
    expect(parseCoreItem('MATH2901 and MATH2931')).toEqual({ and: ['MATH2901', 'MATH2931'] });
    expect(printCoreItem({ or: ['COMP1511', 'COMP1521'] })).toBe('COMP1511 or COMP1521');
    expectCode(() => parseCoreItem('COMP1511 or COMP1521 and COMP1531'), 'BAD_CORE_ITEM');
    expectCode(() => parseCoreItem('COMP9***'), 'BAD_CORE_ITEM');
    expect(parseCoreItem('COMP9***', { allowPatterns: true })).toBe('COMP9***');
  });
});

describe('normalize', () => {
  it('27: N structured shorthands become canonical (P3)', () => {
    expect(normalizeCondition({ done: 'COMP1511' }).ast).toBe('COMP1511');
    expect(normalizeCondition({ uoc: 102 }).ast).toEqual({ uoc: { min: 102 } });
    expect(normalizeCondition({ wam: 65 }).ast).toEqual({ wam: { min: 65 } });
    expect(normalizeCondition({ program: [3778] }).ast).toEqual({ program: ['3778'] });
    expect(normalizeSelector(['COMP1511', 'COMP1521']).ast).toEqual({
      or: ['COMP1511', 'COMP1521']
    });
    expect(normalizeSelector(['COMP1511']).ast).toBe('COMP1511');
    expect(normalizeSelector({ course: 'COMP1511' }).ast).toBe('COMP1511');
    expect(normalizeCondition({ grade: { min: 65, in: 'MATH1231' } }).ast).toEqual({
      grade: { min: 65, course: 'MATH1231' }
    });
    expect(normalizeCondition({ manual: { text: 'x' } }).ast).toEqual({ manual: 'x' });
    expect(conditionToCompact({ uoc: { min: 18, in: ['COMP****', 'MATH****'] } })).toBe(
      'uoc(18, COMP**** or MATH****)'
    );
  });

  it('28: N compact strings inside structured lists are parenthesised when printed (P2)', () => {
    const v = { and: ['COMP1511 or COMP1521', 'COMP1531'] };
    expect(normalizeCondition(v).ast).toEqual({
      and: [{ or: ['COMP1511', 'COMP1521'] }, 'COMP1531']
    });
    expect(conditionToCompact(v)).toBe('(COMP1511 or COMP1521) and COMP1531');
  });

  it('29: N flattens same-op nesting and singletons', () => {
    expect(normalizeCondition({ and: ['COMP1511 and COMP1521', 'COMP1531'] }).ast).toEqual({
      and: ['COMP1511', 'COMP1521', 'COMP1531']
    });
    expect(normalizeCondition({ and: ['COMP1511'] }).ast).toBe('COMP1511');
    expect(selectorToCompact({ or: [{ or: ['A***1***', 'B***1***'] }, 'COMP1511'] })).toBe(
      'A***1*** or B***1*** or COMP1511'
    );
  });

  it('30: N manual with id is kept but not compactable (P8); bad structure', () => {
    const manual = { manual: { text: 'x', id: 'a' } };
    expect(normalizeCondition(manual).ast).toEqual(manual);
    expectCode(() => printCondition(normalizeCondition(manual).ast), 'NOT_COMPACTABLE');
    expectCode(() => normalizeCondition({ foo: 1 }), 'BAD_STRUCTURE');
    const e = errorOf(() => normalizeCondition({ and: [] }));
    expect(e.code).toBe('BAD_STRUCTURE');
    expect(e.at).toEqual(['and']);
  });

  it('tags refs and errors inside structured values with `at`', () => {
    const r = normalizeCondition({ or: ['program(@bcom)', { uoc: { min: 6, in: { set: 'x' } } }] });
    expect(r.refs).toEqual([
      { kind: 'program_group', name: 'bcom', span: { start: 8, end: 13 }, at: ['or', 0] },
      { kind: 'set', name: 'x', span: { start: 0, end: 0 }, at: ['or', 1, 'uoc', 'in', 'set'] }
    ]);
    const e = errorOf(() => normalizeCondition({ and: ['COMP1511', 'wam(999)'] }));
    expect(e.code).toBe('MARK_OUT_OF_RANGE');
    expect(e.at).toEqual(['and', 1]);
    expectCode(() => normalizeCondition({ cores: { in: 'major' } }), 'IN_INSIDE_CORES');
  });

  it('passes lenient mode through to nested compact strings', () => {
    const r = normalizeCondition({ and: ['COMP1511', 'newatom(1)'] }, { lenient: true });
    expect(r.ast).toEqual({ and: ['COMP1511', { manual: 'newatom(1)' }] });
    expect(r.warnings).toHaveLength(1);
  });

  it('round-trips the structured examples of SCHEMA.md §5.1', () => {
    const cases: [unknown, string][] = [
      [{ coreq: 'COMP1511' }, 'coreq(COMP1511)'],
      [{ uoc: { min: 18, in: 'COMP****' } }, 'uoc(18, COMP****)'],
      [{ wam: { min: 70, in: 'level:3' } }, 'wam(70, level:3)'],
      [{ grade: { min: 65, in: 'in:major/thesis' } }, 'grade(65, in:major/thesis)'],
      [{ cores: 'level:3' }, 'cores(level:3)'],
      [{ complete: 'arts' }, 'complete(arts)'],
      [{ spec: ['COMP*1', 'COMPBH', '@g'] }, 'spec(COMP*1, COMPBH, @g)']
    ];
    for (const [v, compact] of cases) {
      expect(conditionToCompact(v)).toBe(compact);
      expect(normalizeCondition(v).ast).toEqual(parseCondition(compact));
    }
    expect(printSelector(normalizeSelector({ level: 3 }).ast)).toBe('level:3');
  });
});
