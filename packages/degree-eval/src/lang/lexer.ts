import { ParseError } from './errors';

export interface Token {
  text: string; // as written; a string literal keeps its quotes
  start: number;
  end: number;
  value?: string; // decoded string literal
}

// Tokens of validate.mjs's TOKEN, minus its leading \s* (skipped separately so offsets point at
// the token, not at the whitespace before it).
const SPACE = /\s*/y;
const TOKEN = /"(?:[^"\\]|\\.)*"|\(|\)|,|[A-Za-z0-9_*:/@.-]+/y;

export const lex = (src: string): Token[] => {
  const out: Token[] = [];
  let i = 0;
  for (;;) {
    SPACE.lastIndex = i;
    SPACE.exec(src);
    i = SPACE.lastIndex;
    if (i >= src.length) return out;
    TOKEN.lastIndex = i;
    const m = TOKEN.exec(src);
    if (!m) {
      if (src[i] === '"') {
        throw new ParseError(
          'UNTERMINATED_STRING',
          'unterminated string',
          { start: i, end: src.length },
          src
        );
      }
      const width = (src.codePointAt(i) ?? 0) > 0xffff ? 2 : 1;
      throw new ParseError(
        'UNEXPECTED_CHAR',
        `unexpected character at ${i}: "${src.slice(i, i + 10)}"`,
        { start: i, end: i + width },
        src
      );
    }
    const text = m[0];
    const token: Token = { text, start: i, end: i + text.length };
    if (text.startsWith('"')) {
      try {
        token.value = JSON.parse(text) as string;
      } catch (e) {
        throw new ParseError(
          'BAD_STRING',
          `bad string literal: ${(e as Error).message}`,
          { start: token.start, end: token.end },
          src
        );
      }
    }
    out.push(token);
    i = token.end;
  }
};
