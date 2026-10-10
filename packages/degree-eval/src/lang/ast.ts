// Canonical ASTs of the compact condition and selector language (SCHEMA.md §5.4, §6).
// The canonical AST *is* the canonical structured form: a bare course is a string, every other
// node is a one-key object, and/or are n-ary with no same-operator child. Spans stay out of the
// AST so deep equality is the round-trip check; they live on errors, warnings and refs.

import type { ParseWarning } from './errors';

export type CourseCode = string; // RX.course
export type NodePathText = string; // RX.nodepath

export type Selector =
  | CourseCode
  | { and: Selector[] } // and/or: length >= 2, no same-op child
  | { or: Selector[] }
  | { not: Selector }
  | { pattern: string }
  | { set: string }
  | { level: number }
  | { faculty: string }
  | { school: string }
  | { career: 'ugrd' | 'pgrd' | 'rsch' }
  | { attr: string }
  | { in: NodePathText }
  | { gened: true }
  | { any: true };

export type Condition =
  | CourseCode
  | boolean
  | { and: Condition[] }
  | { or: Condition[] }
  | { not: Condition }
  | { coreq: CourseCode }
  | { planned: CourseCode }
  | { uoc: { min: number; in?: Selector } }
  | { wam: { min: number; in?: Selector } }
  | { grade: { min: number; course: CourseCode } | { min: number; in: Selector } } // `in` is never a bare course
  | { cores: true | Selector }
  | { complete: NodePathText }
  | { reported_wam: { min: number; label: string } }
  | { program: string[] } // program codes are always strings
  | { spec: string[] }
  | { manual: string | { text: string; id: string } }; // object only when id is present

export type CoreItem = CourseCode | { or: string[] } | { and: string[] }; // patterns only with allowPatterns

export type NodePath =
  | { form: 'root' }
  | { form: 'spec'; spec: string; ids: string[] } // spec:CODE[/id…]
  | { form: 'rel'; segments: ({ id: string } | { spec: string })[] }; // first segment is always an id

export interface Span {
  start: number; // UTF-16 offsets, end exclusive
  end: number;
}

export type RefKind = 'set' | 'program_group' | 'spec_group' | 'faculty' | 'school' | 'in' | 'node';

export interface Ref {
  kind: RefKind;
  name: string;
  span: Span;
  at?: (string | number)[]; // location inside a structured value
}

export interface ParseOptions {
  lenient?: boolean; // SCHEMA.md §10; conditions only
}

export interface Parsed<T> {
  ast: T;
  refs: Ref[];
  warnings: ParseWarning[];
}

type KeysOf<T> = T extends object ? keyof T : never;
export type ConditionKind = 'course' | 'bool' | KeysOf<Condition>;
export type SelectorKind = 'course' | KeysOf<Selector>;

export const conditionKind = (c: Condition): ConditionKind => {
  if (typeof c === 'string') return 'course';
  if (typeof c === 'boolean') return 'bool';
  return Object.keys(c)[0] as KeysOf<Condition>;
};

export const selectorKind = (s: Selector): SelectorKind =>
  typeof s === 'string' ? 'course' : (Object.keys(s)[0] as KeysOf<Selector>);

// Structural deep equality that ignores object key order.
export const astEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((x, i) => astEqual(x, b[i]))
    );
  }
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every(
      (k) =>
        Object.hasOwn(b, k) &&
        astEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    )
  );
};

export type BoolOp = 'and' | 'or';

// Spreads operands that are themselves `op` nodes, so and/or never nest in the same operator.
export const flattenOp = <T>(op: BoolOp, items: T[]): T[] =>
  items.flatMap((x) => {
    if (typeof x === 'object' && x !== null && !Array.isArray(x)) {
      const keys = Object.keys(x);
      if (keys.length === 1 && keys[0] === op) return (x as unknown as Record<BoolOp, T[]>)[op];
    }
    return [x];
  });
