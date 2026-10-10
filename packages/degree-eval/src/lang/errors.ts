import type { Span } from './ast';

// Messages keep the tools/validate.mjs text verbatim wherever it has one, so the M8 port still
// matches tools/negative/expected.txt. Positions live in `span`, never in the message.
export type ParseErrorCode =
  | 'UNEXPECTED_CHAR'
  | 'UNTERMINATED_STRING'
  | 'BAD_STRING'
  | 'UNEXPECTED_END'
  | 'EXPECTED_TOKEN'
  | 'TRAILING_INPUT'
  | 'MIXED_AND_OR'
  | 'UNKNOWN_ATOM'
  | 'UNKNOWN_FUNCTION'
  | 'BAD_ARGUMENT'
  | 'BAD_NODE_PATH'
  | 'BAD_SELECTOR_VALUE'
  | 'MARK_OUT_OF_RANGE'
  | 'IN_INSIDE_CORES'
  | 'BAD_CORE_ITEM'
  | 'BAD_STRUCTURE'
  | 'NOT_COMPACTABLE';

export class ParseError extends Error {
  override readonly name = 'ParseError';

  constructor(
    readonly code: ParseErrorCode,
    message: string,
    readonly span: Span,
    readonly source: string,
    // location inside a structured value (normalize); absent for a top-level compact string
    readonly at?: (string | number)[]
  ) {
    super(message);
  }
}

export interface ParseWarning {
  code: 'LENIENT_UNKNOWN_ATOM';
  message: string;
  span: Span;
}

// `$`, `$.and[1].uoc.in`, …
export const formatAt = (at: readonly (string | number)[]): string =>
  `$${at.map((x) => (typeof x === 'number' ? `[${x}]` : `.${x}`)).join('')}`;

// `${message} (col N)` plus the offending source line and a caret under the span.
export const formatParseError = (e: ParseError): string => {
  const { start, end } = e.span;
  const head = `${e.message} (col ${start + 1})`;
  if (!e.source) return head;
  const lineStart = e.source.lastIndexOf('\n', start - 1) + 1;
  const nl = e.source.indexOf('\n', start);
  const lineEnd = nl < 0 ? e.source.length : nl;
  const width = Math.max(1, Math.min(end, lineEnd) - start);
  return `${head}\n${e.source.slice(lineStart, lineEnd)}\n${' '.repeat(start - lineStart)}${'^'.repeat(width)}`;
};
