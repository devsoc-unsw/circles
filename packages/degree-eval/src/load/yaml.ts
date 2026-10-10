import { parseDocument } from 'yaml';

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

export const parseYaml = (text: string): unknown => {
  if (text.length > MAX_CHARS) {
    throw new YamlError('YAML_TOO_LARGE', `document larger than ${MAX_CHARS} bytes`);
  }
  const doc = parseDocument(text, { merge: false });
  const first = doc.errors[0];
  if (first) {
    const pos = first.linePos?.[0];
    throw new YamlError('YAML_SYNTAX', first.message, pos?.line, pos?.col);
  }
  if (/^\s*<<\s*:/m.test(text)) {
    throw new YamlError('YAML_MERGE_KEY', 'YAML merge keys (<<) are not allowed');
  }
  try {
    return doc.toJS({ maxAliasCount: MAX_ALIASES }) as unknown;
  } catch (e) {
    throw new YamlError('YAML_ALIASES', (e as Error).message);
  }
};
