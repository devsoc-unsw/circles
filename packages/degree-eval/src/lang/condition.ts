import type { Condition, Parsed, ParseOptions, Selector } from './ast';
import { ParseError } from './errors';
import type { Token } from './lexer';
import { MAX_MARK, RX } from './patterns';
import { SelectorParser } from './selector';

// Errors that lenient mode (P7, SCHEMA.md §10) turns into manual(<whole string>): an unknown
// condition-level atom or function. Selector-level unknown atoms still throw.
const lenientEligible = new WeakSet<ParseError>();

// condition = c_term {and|or c_term}; validate.mjs cond/cterm/catom
export class ConditionParser extends SelectorParser {
  cond(): Condition {
    return this.boolExpr(() => this.cterm());
  }

  cterm(): Condition {
    const t = this.peek();
    if (t?.text === 'not') {
      this.next();
      return { not: this.cterm() };
    }
    if (t?.text === '(') {
      this.next();
      const e = this.cond();
      this.eat(')');
      return e;
    }
    return this.catom();
  }

  // validate.mjs `mark`: marks above 100 are rejected
  mark(tok: Token, fn: string): number {
    const n = Number(tok.text);
    if (n > MAX_MARK) {
      this.fail('MARK_OUT_OF_RANGE', `${fn}() mark ${tok.text} is above 100`, this.spanOf(tok));
    }
    return n;
  }

  // the next token if it matches `rx`, else BAD_ARGUMENT with `message`
  arg(rx: RegExp, message: string): Token {
    const tok = this.next();
    if (!tok || !rx.test(tok.text)) this.fail('BAD_ARGUMENT', message, this.spanOf(tok));
    return tok;
  }

  unknown(code: 'UNKNOWN_ATOM' | 'UNKNOWN_FUNCTION', message: string, start: Token): never {
    let { end } = start;
    if (code === 'UNKNOWN_FUNCTION') {
      // span: the function name up to its matching `)`, or to the end of the input
      end = this.source.length;
      let depth = 0;
      for (let i = this.pos; i < this.tokens.length; i++) {
        const t = this.tokens[i] as Token;
        depth += { '(': 1, ')': -1 }[t.text] ?? 0;
        if (t.text === ')' && depth === 0) {
          end = t.end;
          break;
        }
      }
    }
    const e = new ParseError(code, message, { start: start.start, end }, this.source);
    lenientEligible.add(e);
    throw e;
  }

  catom(): Condition {
    const tok = this.next();
    if (!tok) return this.fail('UNEXPECTED_END', 'unexpected end', this.spanOf(tok));
    const t = tok.text;
    if (RX.course.test(t)) return t;
    if (t === 'true' || t === 'false') return t === 'true';
    if (this.peek()?.text !== '(') {
      return this.unknown('UNKNOWN_ATOM', `unknown condition atom "${t}"`, tok);
    }
    this.eat('(');
    let r: Condition;
    switch (t) {
      case 'coreq':
      case 'planned': {
        const c = this.arg(RX.course, `${t}() needs a course code`).text;
        r = t === 'coreq' ? { coreq: c } : { planned: c };
        break;
      }
      case 'uoc':
      case 'wam': {
        const n = this.arg(t === 'uoc' ? RX.int : RX.number, `${t}() needs a number`);
        const body: { min: number; in?: Selector } = {
          min: t === 'wam' ? this.mark(n, t) : Number(n.text)
        };
        if (this.peek()?.text === ',') {
          this.next();
          body.in = this.sel();
        }
        r = t === 'uoc' ? { uoc: body } : { wam: body };
        break;
      }
      case 'grade': {
        const n = this.arg(RX.number, 'grade() needs a mark');
        const min = this.mark(n, t);
        this.eat(',');
        const s = this.sel();
        r = { grade: typeof s === 'string' ? { min, course: s } : { min, in: s } };
        break;
      }
      case 'reported_wam': {
        const n = this.arg(RX.number, 'reported_wam() needs a number');
        const min = this.mark(n, t);
        this.eat(',');
        const label = this.arg(RX.label, 'reported_wam() needs a lowercase label').text;
        r = { reported_wam: { min, label } };
        break;
      }
      case 'complete': {
        const p = this.next();
        if (!p || !RX.nodepath.test(p.text)) {
          this.fail(
            'BAD_NODE_PATH',
            `complete() needs a node path, got "${p?.text}"`,
            this.spanOf(p)
          );
        }
        this.addRef('node', p.text, p);
        r = { complete: p.text };
        break;
      }
      case 'cores': {
        if (this.peek()?.text === ')') {
          r = { cores: true };
          break;
        }
        const before = this.refs.length;
        const s = this.sel();
        const inRef = this.refs.slice(before).find((x) => x.kind === 'in');
        if (inRef) {
          this.fail(
            'IN_INSIDE_CORES',
            'in: is not allowed inside cores(); use complete(node)',
            inRef.span
          );
        }
        r = { cores: s };
        break;
      }
      case 'program':
      case 'spec': {
        const ok =
          t === 'program'
            ? (x: string) => RX.program.test(x) || RX.ref.test(x)
            : (x: string) => RX.spec.test(x) || RX.spattern.test(x) || RX.ref.test(x);
        const xs: string[] = [];
        do {
          const x = this.next();
          if (!x || !ok(x.text)) {
            this.fail('BAD_ARGUMENT', `bad ${t}() argument "${x?.text}"`, this.spanOf(x));
          }
          if (RX.ref.test(x.text)) {
            this.addRef(t === 'program' ? 'program_group' : 'spec_group', x.text.slice(1), x);
          }
          xs.push(x.text);
        } while (this.peek()?.text === ',' && this.next());
        r = t === 'program' ? { program: xs } : { spec: xs };
        break;
      }
      case 'manual': {
        const s = this.next();
        if (s?.value === undefined) {
          this.fail('BAD_ARGUMENT', 'manual() needs a quoted string', this.spanOf(s));
        }
        r = { manual: s.value };
        break;
      }
      default:
        return this.unknown('UNKNOWN_FUNCTION', `unknown function "${t}"`, tok);
    }
    this.eat(')');
    return r;
  }
}

export const analyzeCondition = (src: string, opts: ParseOptions = {}): Parsed<Condition> => {
  try {
    const p = new ConditionParser(src);
    const ast = p.cond();
    p.end();
    return { ast, refs: p.refs, warnings: [] };
  } catch (e) {
    if (opts.lenient && e instanceof ParseError && lenientEligible.has(e)) {
      return {
        ast: { manual: src },
        refs: [],
        warnings: [{ code: 'LENIENT_UNKNOWN_ATOM', message: e.message, span: e.span }]
      };
    }
    throw e;
  }
};

export const parseCondition = (src: string, opts?: ParseOptions): Condition =>
  analyzeCondition(src, opts).ast;
