export * from './lang';
export type { Diagnostic, Doc, SchemaVersion, SourceFile } from './load';
export { formatDiagnostic, loadDocuments, SUPPORTED_SCHEMA_VERSION } from './load';
export type { Site, SiteKind } from './load/sites';
export { documentSites } from './load/sites';
export type { YamlErrorCode } from './load/yaml';
export { MAX_ALIASES, MAX_CHARS, parseYaml, YamlError } from './load/yaml';
export type { DocKind } from './validate';
export { checkDocumentSchema, checkFixtureSchema } from './validate';

export const SCHEMA_VERSION = '1.0';
