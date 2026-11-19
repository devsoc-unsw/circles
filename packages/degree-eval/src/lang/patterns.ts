// Lexical shapes of SCHEMA.md §5.4, unchanged from tools/validate.mjs (RX, SEG_ID, SEG_SPEC, ITEM).

export const SEG_ID = '[a-z0-9][a-z0-9-]*';
export const SEG_SPEC = '[A-Z]{5}[0-9A-Z]';

export const RX = {
  course: /^[A-Z]{4}[0-9]{4}$/,
  cpattern: /^[A-Z*]{4}[0-9*]{4}$/,
  spec: /^[A-Z]{5}[0-9A-Z]$/,
  spattern: /^[A-Z*]{5}[0-9A-Z*]$/,
  program: /^[0-9]{4}$/,
  ref: /^@[a-z][a-z0-9_]*$/,
  label: /^[a-z][a-z0-9_]*$/,
  number: /^[0-9]+(\.[0-9]+)?$/,
  int: /^[0-9]+$/,
  nodepath: new RegExp(
    `^(root|spec:${SEG_SPEC}(/${SEG_ID})*|${SEG_ID}(/(${SEG_ID}|${SEG_SPEC}))*)$`
  ),
  org: /^[A-Z][A-Z0-9_]*$/
} as const;

export const SEG_ID_RX = new RegExp(`^${SEG_ID}$`);

// core and substitution items (EBNF `item`)
export const ITEM = /^[A-Z*]{4}[0-9*]{4}(( or [A-Z*]{4}[0-9*]{4})*|( and [A-Z*]{4}[0-9*]{4})*)$/;

// values of the `key:value` selector atoms
export const SELECTOR_VALUE = {
  level: /^[0-9]$/,
  faculty: RX.org,
  school: RX.org,
  career: /^(ugrd|pgrd|rsch)$/,
  attr: /^[a-z][a-z0-9_]*$/,
  in: RX.nodepath
} as const;

export const MAX_MARK = 100;
