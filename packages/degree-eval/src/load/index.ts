import { parseCoreItem } from '../lang/core-item';
import { ParseError } from '../lang/errors';
import { parseNodePath } from '../lang/node-path';
import { normalizeCondition, normalizeSelector } from '../lang/normalize';
import type { DocKind } from '../validate';
import { checkDocumentSchema, DOC_KINDS, explainDocument } from '../validate';
import type { Site } from './sites';
import { documentSites } from './sites';
import type { ParsedYaml } from './yaml';
import { parseYamlWithPositions, YamlError } from './yaml';

// One document's text and where it came from. The backend serves `repo` documents; a file the
// student loads in the browser is `local` (SCHEMA.md §2.4).
export interface SourceFile {
  path: string;
  text: string;
  origin: 'repo' | 'local';
}

export interface Diagnostic {
  file?: string;
  path?: string; // location inside the document, e.g. requirements[3].courses[0]
  line?: number; // 1-based position in the YAML text, when known
  col?: number;
  level: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface SchemaVersion {
  major: number;
  minor: number;
}

export interface Doc {
  file: string;
  origin: SourceFile['origin'];
  kind: DocKind;
  schemaVersion: SchemaVersion;
  lenient: boolean; // a newer minor version than this client (SCHEMA.md §10)
  data: Record<string, unknown>; // the parsed YAML, structurally valid
}

export const SUPPORTED_SCHEMA_VERSION: SchemaVersion = { major: 1, minor: 0 };

const NODE_KINDS = [
  'group',
  'core',
  'pool',
  'spec',
  'limit',
  'maturity',
  'timing',
  'check',
  'info'
];

type Report = (d: Omit<Diagnostic, 'file'>) => void;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// `file:line:col: message` (or `file: message` without a position)
export const formatDiagnostic = (d: Diagnostic): string => {
  const where = d.line === undefined ? d.file : `${d.file ?? ''}:${d.line}:${d.col ?? 1}`;
  return where === undefined ? d.message : `${where}: ${d.message}`;
};

// a short, readable rendering of a site value for messages
const preview = (v: unknown): string =>
  (typeof v === 'string' ? v : JSON.stringify(v)).slice(0, 60);

const atSuffix = (at: readonly (string | number)[] = []): string =>
  at.map((x) => (typeof x === 'number' ? `[${x}]` : `.${x}`)).join('');

// Conditions only nest selectors under uoc/wam/grade `in` and under `cores`.
const grammarOf = (site: Site, at: readonly (string | number)[] = []): string =>
  site.kind === 'selector' || at.some((x) => x === 'in' || x === 'cores')
    ? 'selector'
    : 'condition';

const position = (yaml: ParsedYaml, loc: (string | number)[], offset = 0) => {
  const p = yaml.locate(loc, { offset });
  return p ? { line: p.line, col: p.col } : {};
};

// Parses one site and reports its errors (validate.mjs message formats, plus a position).
const checkSite = (site: Site, lenient: boolean, yaml: ParsedYaml, report: Report): boolean => {
  const { where, kind, value, loc } = site;
  if (value === undefined || value === null) return true; // a missing field is a schema error
  try {
    switch (kind) {
      case 'selector':
        normalizeSelector(value);
        break;
      case 'condition':
      case 'exclude':
        for (const w of normalizeCondition(value, { lenient }).warnings) {
          report({
            path: where,
            ...position(yaml, loc, w.span.start),
            level: 'warning',
            code: w.code,
            message: `${where}: condition "${preview(value)}": ${w.message} (read as manual)`
          });
        }
        break;
      case 'item':
        if (typeof value === 'string') parseCoreItem(value);
        break;
      case 'substitution':
        if (typeof value === 'string') parseCoreItem(value, { allowPatterns: true });
        break;
      default:
        if (typeof value === 'string') parseNodePath(value);
    }
    return true;
  } catch (e) {
    if (!(e instanceof ParseError)) throw e;
    const path = `${where}${atSuffix(e.at)}`;
    let message: string;
    if (kind === 'item') message = `${where}: ${e.message}`;
    else if (kind === 'substitution') message = `${where}: bad with "${preview(value)}"`;
    else if (kind === 'exclude') message = `${where} "${preview(value)}": ${e.message}`;
    else if (kind === 'nodepath') message = `${where}: ${e.message}`;
    else if (e.code === 'BAD_STRUCTURE' || !e.source) {
      message = `${path}: ${e.message.replace(/^\$[^:]*: /, '')}`;
    } else {
      message = `${path}: ${grammarOf(site, e.at)} "${e.source.slice(0, 60)}": ${e.message}`;
    }
    report({
      path,
      ...position(yaml, [...loc, ...(e.at ?? [])], e.source ? e.span.start : 0),
      level: 'error',
      code: e.code,
      message
    });
    return false;
  }
};

// Lenient load: a node kind this client does not know evaluates as info {confirm: true}.
const replaceUnknownNodeKinds = (d: Record<string, unknown>): string[] => {
  const replaced: string[] = [];
  const visit = (list: unknown) => {
    if (!Array.isArray(list)) return;
    list.forEach((n: unknown, i) => {
      if (!isObj(n)) return;
      if (typeof n.kind === 'string' && !NODE_KINDS.includes(n.kind)) {
        replaced.push(`${String(n.id)} (${n.kind})`);
        // eslint-disable-next-line no-param-reassign -- rewriting the freshly parsed document
        list[i] = {
          id: n.id,
          kind: 'info',
          ...(typeof n.title === 'string' ? { title: n.title } : {}),
          text: `This rule needs a newer version of Circles (node kind "${n.kind}").`,
          confirm: true
        };
      } else if (n.kind === 'group') visit(n.children);
    });
  };
  visit(d.requirements);
  return replaced;
};

const parseVersion = (v: unknown): SchemaVersion | undefined => {
  const m = typeof v === 'string' ? /^(\d+)\.(\d+)$/.exec(v) : null;
  return m ? { major: Number(m[1]), minor: Number(m[2]) } : undefined;
};

interface Issues {
  ok: boolean;
  paths: (string | number)[][];
}

const isUnder = (p: readonly (string | number)[], base: readonly (string | number)[]) =>
  p.length >= base.length && base.every((x, i) => p[i] === x);

// Structure errors, one readable diagnostic each (warnings under a lenient load).
const checkSchema = (data: unknown, yaml: ParsedYaml, lenient: boolean, report: Report): Issues => {
  if (checkDocumentSchema(data) === null) return { ok: true, paths: [] };
  const issues = explainDocument(data);
  for (const issue of issues) {
    const p = yaml.locate(issue.path, { key: issue.field ?? false });
    report({
      path: issue.path.length ? issue.message.slice(0, issue.message.indexOf(': ')) : 'document',
      ...(p ? { line: p.line, col: p.col } : {}),
      level: lenient ? 'warning' : 'error',
      code: lenient ? 'SCHEMA_LENIENT' : 'SCHEMA',
      message: lenient ? `${issue.message} (ignored: newer schema_version)` : issue.message
    });
  }
  return { ok: lenient, paths: issues.map((i) => i.path) };
};

// Loads one file; reports through `report` and returns the document unless it has errors.
const loadOne = ({ path: file, text, origin }: SourceFile, report: Report): Doc | undefined => {
  let yaml: ParsedYaml;
  try {
    yaml = parseYamlWithPositions(text);
  } catch (e) {
    if (!(e instanceof YamlError)) throw e;
    report({
      ...(e.line === undefined ? {} : { line: e.line, col: e.col ?? 1 }),
      level: 'error',
      code: e.code,
      message: `yaml: ${e.message}`
    });
    return undefined;
  }
  const { data } = yaml;

  const version = isObj(data) ? parseVersion(data.schema_version) : undefined;
  if (version && version.major !== SUPPORTED_SCHEMA_VERSION.major) {
    report({
      path: 'schema_version',
      ...position(yaml, ['schema_version']),
      level: 'error',
      code: 'SCHEMA_VERSION_UNSUPPORTED',
      message: `schema_version: ${version.major}.${version.minor} is not supported (this version of Circles reads ${SUPPORTED_SCHEMA_VERSION.major}.x)`
    });
    return undefined;
  }
  const lenient = version !== undefined && version.minor > SUPPORTED_SCHEMA_VERSION.minor;

  if (isObj(data)) {
    // a file loaded in the browser always ranks as local (§2.4)
    if (origin === 'local') {
      data.provenance = { ...(isObj(data.provenance) ? data.provenance : {}), source: 'local' };
    }
    const replaced = lenient ? replaceUnknownNodeKinds(data) : [];
    if (replaced.length) {
      report({
        level: 'info',
        code: 'LENIENT_NODE_KIND',
        message: `newer schema_version: read as info nodes: ${replaced.join(', ')}`
      });
    }
  }

  const schema = checkSchema(data, yaml, lenient, report);
  let { ok } = schema;
  if (!isObj(data)) return undefined;
  for (const site of documentSites(data)) {
    // a value the schema already reported is not reported again by the parser
    if (!schema.paths.some((p) => isUnder(p, site.loc))) {
      ok = checkSite(site, lenient, yaml, report) && ok;
    }
  }
  if (!ok || !version || !DOC_KINDS.includes(data.kind as DocKind)) return undefined;
  return { file, origin, kind: data.kind as DocKind, schemaVersion: version, lenient, data };
};

// Loads documents: YAML under the §2.1 limits, schema_version handling (§10: reject a different
// major, strict for a known minor, lenient for a newer one), structure validation (§11 layer 1)
// and every compact string parsed (§11 layer 2). Documents with errors are left out of `docs`;
// cross-reference checks are not done here (M8).
export const loadDocuments = (
  files: readonly SourceFile[]
): { docs: Doc[]; diagnostics: Diagnostic[] } => {
  const docs: Doc[] = [];
  const diagnostics: Diagnostic[] = [];
  for (const f of files) {
    const doc = loadOne(f, (d) => diagnostics.push({ file: f.path, ...d }));
    if (doc) docs.push(doc);
  }
  return { docs, diagnostics };
};
