import type { Condition, Selector } from './ast';
import { ParseError } from './errors';

// Canonical printers (SCHEMA.md §5.4): words, single spaces around operators, ", " after commas,
// parentheses exactly around and/or operands of and/or and of not; strings via JSON.stringify,
// numbers via String(n). parse(print(ast)) equals ast.

const group = <T>(
  op: 'and' | 'or',
  items: T[],
  print: (x: T, nested: boolean) => string,
  nested: boolean
): string => {
  const s = items.map((x) => print(x, true)).join(` ${op} `);
  return nested ? `(${s})` : s;
};

const printS = (s: Selector, nested: boolean): string => {
  if (typeof s === 'string') return s;
  if ('and' in s) return group('and', s.and, printS, nested);
  if ('or' in s) return group('or', s.or, printS, nested);
  if ('not' in s) return `not ${printS(s.not, true)}`;
  if ('pattern' in s) return s.pattern;
  if ('set' in s) return `@${s.set}`;
  if ('any' in s) return 'any';
  if ('gened' in s) return 'gened';
  if ('level' in s) return `level:${String(s.level)}`;
  if ('faculty' in s) return `faculty:${s.faculty}`;
  if ('school' in s) return `school:${s.school}`;
  if ('career' in s) return `career:${s.career}`;
  if ('attr' in s) return `attr:${s.attr}`;
  return `in:${s.in}`;
};

export const printSelector = (s: Selector): string => printS(s, false);

const withIn = (fn: string, v: { min: number; in?: Selector }): string =>
  `${fn}(${String(v.min)}${v.in === undefined ? '' : `, ${printSelector(v.in)}`})`;

const printC = (c: Condition, nested: boolean): string => {
  if (typeof c === 'string') return c;
  if (typeof c === 'boolean') return String(c);
  if ('and' in c) return group('and', c.and, printC, nested);
  if ('or' in c) return group('or', c.or, printC, nested);
  if ('not' in c) return `not ${printC(c.not, true)}`;
  if ('coreq' in c) return `coreq(${c.coreq})`;
  if ('planned' in c) return `planned(${c.planned})`;
  if ('complete' in c) return `complete(${c.complete})`;
  if ('uoc' in c) return withIn('uoc', c.uoc);
  if ('wam' in c) return withIn('wam', c.wam);
  if ('grade' in c) {
    const g = c.grade;
    return `grade(${String(g.min)}, ${'course' in g ? g.course : printSelector(g.in)})`;
  }
  if ('reported_wam' in c)
    return `reported_wam(${String(c.reported_wam.min)}, ${c.reported_wam.label})`;
  if ('cores' in c) return c.cores === true ? 'cores()' : `cores(${printSelector(c.cores)})`;
  if ('program' in c) return `program(${c.program.join(', ')})`;
  if ('spec' in c) return `spec(${c.spec.join(', ')})`;
  if (typeof c.manual === 'string') return `manual(${JSON.stringify(c.manual)})`;
  // P8 / D3: the compact form has nowhere to keep the id, and it is never dropped silently
  throw new ParseError(
    'NOT_COMPACTABLE',
    'manual with id has no compact form',
    { start: 0, end: 0 },
    ''
  );
};

export const printCondition = (c: Condition): string => printC(c, false);
