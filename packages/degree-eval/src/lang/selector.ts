import type { Parsed, Selector } from './ast';
import { Cursor } from './parser';
import { RX, SELECTOR_VALUE } from './patterns';

const KEYED_ATOM = /^(level|faculty|school|career|attr|in):(.+)$/;

// selector = s_term {and|or s_term}; validate.mjs sel/sterm/satom
export class SelectorParser extends Cursor {
  sel(): Selector {
    return this.boolExpr(() => this.sterm());
  }

  sterm(): Selector {
    const t = this.peek();
    if (t?.text === 'not') {
      this.next();
      return { not: this.sterm() };
    }
    if (t?.text === '(') {
      this.next();
      const e = this.sel();
      this.eat(')');
      return e;
    }
    return this.satom();
  }

  satom(): Selector {
    const tok = this.next();
    if (!tok) return this.fail('UNEXPECTED_END', 'unexpected end of selector', this.spanOf(tok));
    const t = tok.text;
    if (RX.course.test(t)) return t;
    if (RX.cpattern.test(t)) return { pattern: t };
    if (RX.ref.test(t)) {
      this.addRef('set', t.slice(1), tok);
      return { set: t.slice(1) };
    }
    if (t === 'any') return { any: true };
    if (t === 'gened') return { gened: true };
    const m = KEYED_ATOM.exec(t);
    if (!m) return this.fail('UNKNOWN_ATOM', `unknown selector atom "${t}"`, this.spanOf(tok));
    const k = m[1] as keyof typeof SELECTOR_VALUE;
    const v = m[2] as string;
    if (!SELECTOR_VALUE[k].test(v)) {
      this.fail(
        k === 'in' ? 'BAD_NODE_PATH' : 'BAD_SELECTOR_VALUE',
        `bad ${k}: value "${v}"`,
        this.spanOf(tok)
      );
    }
    switch (k) {
      case 'level':
        return { level: Number(v) };
      case 'career':
        return { career: v as 'ugrd' | 'pgrd' | 'rsch' };
      case 'attr':
        return { attr: v };
      case 'in':
        this.addRef('in', v, tok);
        return { in: v };
      default:
        this.addRef(k, v, tok);
        return k === 'faculty' ? { faculty: v } : { school: v };
    }
  }
}

export const analyzeSelector = (src: string): Parsed<Selector> => {
  const p = new SelectorParser(src);
  const ast = p.sel();
  p.end();
  return { ast, refs: p.refs, warnings: [] };
};

export const parseSelector = (src: string): Selector => analyzeSelector(src).ast;
