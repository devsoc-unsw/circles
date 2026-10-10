// One validation pass over a documents directory and a fixtures directory, as tools/validate.mjs
// `run` does: YAML, schema and compact-string parse errors (§11 layers 1–2, from the loader), cross-
// reference checks and lints (layer 3, checkDocs), fixture checks (checkFixture), and the parse
// census. No file system access: the CLI reads the files.
import type { Diagnostic } from '../load';
import { loadDocuments } from '../load';
import { parseYaml } from '../load/yaml';
import { checkFixtureSchema } from '.';
import { checkDocs, checkFixture } from './semantic';
import type { ParseStats } from './stats';
import { parseStats } from './stats';

export interface TextFile {
  path: string;
  text: string;
}

export interface ValidationReport {
  documents: number;
  fixtures: number;
  stats: ParseStats;
  errors: Diagnostic[];
  warnings: Diagnostic[]; // lints are the warnings whose message contains ": lint: "
}

const tryParse = (text: string): unknown => {
  try {
    return parseYaml(text);
  } catch {
    return undefined;
  }
};

// RX.spec in validate.mjs
const SPEC_CODE = /^[A-Z]{5}[0-9A-Z]$/;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// `read` returns a fixture's bundle document text by its fixture path (relative to the root).
export const validateSources = (
  documents: readonly TextFile[],
  fixtures: readonly TextFile[] = [],
  read: (path: string) => string | undefined = () => undefined
): ValidationReport => {
  const loaded = loadDocuments(documents.map((f) => ({ ...f, origin: 'repo' as const })));
  const docs: { file: string; d: Record<string, unknown> }[] = documents.flatMap((f) => {
    const d = tryParse(f.text);
    return isObj(d) ? [{ file: f.path, d }] : [];
  });
  const semantic = checkDocs(docs);
  const errors = [...loaded.diagnostics.filter((d) => d.level === 'error'), ...semantic.errors];
  const warnings = [...loaded.diagnostics.filter((d) => d.level !== 'error'), ...semantic.warnings];

  // validate.mjs run(): note which spec options resolve to a document in the set
  const specNodes = function* walk(list: unknown): Generator<Record<string, unknown>> {
    for (const x of Array.isArray(list) ? list : []) {
      if (isObj(x)) {
        yield x;
        if (x.kind === 'group') yield* walk(x.children);
      }
    }
  };
  for (const { file, d } of docs) {
    for (const n of specNodes(d.requirements)) {
      if (n.kind === 'spec' && Array.isArray(n.options)) {
        for (const o of n.options) {
          const found =
            typeof o === 'string' && SPEC_CODE.test(o) && typeof d.year === 'number'
              ? semantic.findDoc('specialisation', o, d.year)
              : undefined;
          const year = (found?.d as Record<string, unknown> | undefined)?.year;
          if (found)
            warnings.push({
              file,
              level: 'info',
              code: 'SPEC_RESOLVED',
              message: `${String(n.id)} option ${o} -> resolved to example doc year ${String(year)}`
            });
        }
      }
    }
  }

  for (const f of fixtures) {
    let fx: unknown;
    try {
      fx = parseYaml(f.text);
    } catch (e) {
      errors.push({
        file: f.path,
        level: 'error',
        code: 'YAML',
        message: `yaml: ${e instanceof Error ? e.message : String(e)}`
      });
    }
    if (fx !== undefined) {
      const shape = checkFixtureSchema(fx);
      if (shape !== null)
        errors.push({
          file: f.path,
          level: 'error',
          code: 'FIXTURE_SCHEMA',
          message: `fixture schema: ${shape}`
        });
      else
        errors.push(
          ...checkFixture(f.path, fx, (p) => {
            const text = read(p);
            return text === undefined ? undefined : tryParse(text);
          })
        );
    }
  }
  return {
    documents: documents.length,
    fixtures: fixtures.length,
    stats: parseStats(docs),
    errors,
    warnings
  };
};
