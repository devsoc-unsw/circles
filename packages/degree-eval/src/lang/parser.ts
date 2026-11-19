import type { BoolOp, Ref, RefKind, Span } from './ast';
import { flattenOp } from './ast';
import type { ParseErrorCode } from './errors';
import { ParseError } from './errors';
import type { Token } from './lexer';
import { lex } from './lexer';

// Token cursor shared by the selector and condition parsers (validate.mjs class P core).
export class Cursor {
  readonly refs: Ref[] = [];

  protected readonly tokens: Token[];

  protected pos = 0;

  constructor(readonly source: string) {
    this.tokens = lex(source);
  }

  peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  next(): Token | undefined {
    const t = this.tokens[this.pos];
    if (t) this.pos += 1;
    return t;
  }

  // span of a token, or the empty span at the end of the input when there is none
  spanOf(t: Token | undefined): Span {
    return t
      ? { start: t.start, end: t.end }
      : { start: this.source.length, end: this.source.length };
  }

  fail(code: ParseErrorCode, message: string, span: Span): never {
    throw new ParseError(code, message, span, this.source);
  }

  eat(x: string): Token {
    const t = this.next();
    if (t?.text !== x) {
      this.fail('EXPECTED_TOKEN', `expected "${x}" but got "${t?.text ?? 'end'}"`, this.spanOf(t));
    }
    return t;
  }

  end(): void {
    const t = this.peek();
    if (t) this.fail('TRAILING_INPUT', `unexpected "${t.text}"`, this.spanOf(t));
  }

  addRef(kind: RefKind, name: string, t: Token): void {
    this.refs.push({ kind, name, span: this.spanOf(t) });
  }

  // A boolean expression with no mixing of and/or at one level. Operands that are parenthesised
  // expressions of the same operator are spread in (P1), so `(A and B) and C` is {and: [A, B, C]}.
  boolExpr<T>(term: () => T): T {
    const items = [term()];
    let op: BoolOp | undefined;
    for (let t = this.peek(); t?.text === 'and' || t?.text === 'or'; t = this.peek()) {
      this.next();
      if (op && t.text !== op) {
        this.fail(
          'MIXED_AND_OR',
          `mixed "and"/"or" at one level near "${t.text}"; add parentheses`,
          this.spanOf(t)
        );
      }
      op = t.text;
      items.push(term());
    }
    return op ? ({ [op]: flattenOp(op, items) } as T) : (items[0] as T);
  }
}
