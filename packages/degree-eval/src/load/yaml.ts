import type { Node } from 'yaml';
import { isMap, isScalar, isSeq, LineCounter, parseDocument } from 'yaml';

// Untrusted-input limits (SCHEMA.md §2.1 "Loading"), ported from tools/validate.mjs loadYaml:
// a size cap, an alias cap (billion-laughs), and no merge keys.
export const MAX_CHARS = 1_000_000;
export const MAX_ALIASES = 100;

export type YamlErrorCode = 'YAML_TOO_LARGE' | 'YAML_SYNTAX' | 'YAML_MERGE_KEY' | 'YAML_ALIASES';

export class YamlError extends Error {
  override readonly name = 'YamlError';

  constructor(
    readonly code: YamlErrorCode,
    message: string,
    readonly line?: number, // 1-based, when known
    readonly col?: number
  ) {
    super(message);
  }
}

export interface Position {
  line: number; // 1-based
  col: number; // 1-based
}

export interface ParsedYaml {
  data: unknown;
  // where the value at `path` starts; with `key`, where its field name starts. Falls back to the
  // nearest existing ancestor (e.g. the mapping that is missing a required field).
  locate(
    path: readonly (string | number)[],
    opts?: { key?: boolean; offset?: number }
  ): Position | undefined;
}

const parse = (text: string) => {
  if (text.length > MAX_CHARS) {
    throw new YamlError('YAML_TOO_LARGE', `document larger than ${MAX_CHARS} bytes`);
  }
  const lineCounter = new LineCounter();
  const doc = parseDocument(text, { merge: false, lineCounter });
  const first = doc.errors[0];
  if (first) {
    const pos = first.linePos?.[0];
    throw new YamlError('YAML_SYNTAX', first.message, pos?.line, pos?.col);
  }
  if (/^\s*<<\s*:/m.test(text)) {
    throw new YamlError('YAML_MERGE_KEY', 'YAML merge keys (<<) are not allowed');
  }
  let data: unknown;
  try {
    data = doc.toJS({ maxAliasCount: MAX_ALIASES }) as unknown;
  } catch (e) {
    throw new YamlError('YAML_ALIASES', (e as Error).message);
  }
  return { doc, data, lineCounter };
};

export const parseYaml = (text: string): unknown => parse(text).data;

export const parseYamlWithPositions = (text: string): ParsedYaml => {
  const { doc, data, lineCounter } = parse(text);
  const pos = (offset: number): Position => lineCounter.linePos(offset);
  return {
    data,
    locate(path, { key = false, offset = 0 } = {}) {
      let node: unknown = doc.contents;
      let keyNode: unknown;
      for (const seg of path) {
        let next: unknown;
        keyNode = undefined;
        if (isSeq(node)) next = node.items[Number(seg)];
        else if (isMap(node)) {
          const pair = node.items.find(
            (it) => isScalar(it.key) && String(it.key.value) === String(seg)
          );
          next = pair?.value;
          keyNode = pair?.key;
        }
        if (next === undefined || next === null) {
          // missing: point at the field name if there is one, else at the parent
          const target = (keyNode ?? node) as Node | undefined;
          return target?.range ? pos(target.range[0]) : undefined;
        }
        node = next;
      }
      const target = (key && keyNode ? keyNode : node) as Node | undefined;
      if (!target?.range) return undefined;
      // a single-line scalar: also point inside it (e.g. at a parse error's column)
      const quoted =
        isScalar(target) && (target.type === 'QUOTE_DOUBLE' || target.type === 'QUOTE_SINGLE');
      const single = !text.slice(target.range[0], target.range[1]).includes('\n');
      return pos(target.range[0] + (offset && single ? offset + (quoted ? 1 : 0) : 0));
    }
  };
};
