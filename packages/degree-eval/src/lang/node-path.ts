import type { NodePath } from './ast';
import { ParseError } from './errors';
import { RX } from './patterns';

// Node paths (SCHEMA.md §4.1, EBNF NODEPATH): `root`, `spec:CODE[/id…]`, or a relative path whose
// first segment is a node id and whose later segments are node ids or spec codes.
export const parseNodePath = (src: string): NodePath => {
  if (!RX.nodepath.test(src)) {
    throw new ParseError(
      'BAD_NODE_PATH',
      `malformed node path "${src}"`,
      { start: 0, end: src.length },
      src
    );
  }
  if (src === 'root') return { form: 'root' };
  const segs = src.split('/');
  if (src.startsWith('spec:')) {
    return { form: 'spec', spec: (segs[0] as string).slice('spec:'.length), ids: segs.slice(1) };
  }
  return {
    form: 'rel',
    segments: segs.map((s) => (RX.spec.test(s) ? { spec: s } : { id: s }))
  };
};

export const printNodePath = (p: NodePath): string => {
  switch (p.form) {
    case 'root':
      return 'root';
    case 'spec':
      return [`spec:${p.spec}`, ...p.ids].join('/');
    default:
      return p.segments.map((s) => ('spec' in s ? s.spec : s.id)).join('/');
  }
};
