import type { CoreItem } from './ast';
import { ParseError } from './errors';
import { ITEM } from './patterns';

// Core and substitution items (EBNF `item`): `A`, `A or B …`, `A and B …` over course codes.
// Patterns (`COMP9***`) are only allowed with `allowPatterns` (substitutions[].with).
export const parseCoreItem = (src: string, opts: { allowPatterns?: boolean } = {}): CoreItem => {
  if (!ITEM.test(src) || (!opts.allowPatterns && src.includes('*'))) {
    throw new ParseError(
      'BAD_CORE_ITEM',
      `bad core item "${src}"`,
      { start: 0, end: src.length },
      src
    );
  }
  if (src.includes(' or ')) return { or: src.split(' or ') };
  if (src.includes(' and ')) return { and: src.split(' and ') };
  return src;
};

export const printCoreItem = (i: CoreItem): string => {
  if (typeof i === 'string') return i;
  return 'or' in i ? i.or.join(' or ') : i.and.join(' and ');
};
