export * from './lang';
export type { Diagnostic, Doc, SchemaVersion, SourceFile } from './load';
export { formatDiagnostic, loadDocuments, SUPPORTED_SCHEMA_VERSION } from './load';
export type { Site, SiteKind } from './load/sites';
export { documentSites } from './load/sites';
export type { YamlErrorCode } from './load/yaml';
export type { ParsedYaml, Position } from './load/yaml';
export { MAX_ALIASES, MAX_CHARS, parseYaml, parseYamlWithPositions, YamlError } from './load/yaml';
export type { DocKind, SchemaIssue } from './validate';
export { checkDocumentSchema, checkFixtureSchema, displayPath, explainDocument } from './validate';

export const SCHEMA_VERSION = '1.0';

export type { TraceEvent } from './eval/allocate';
export type { EvaluateOptions, ExplainEvent } from './eval/evaluate';
export { checkInstance, evaluate, explain, nodeAt, unlockedAt } from './eval/evaluate';
export type {
  AllocationKind,
  CatalogueProvider,
  ConditionResult,
  CourseFacts,
  Evaluation,
  InstanceAllocation,
  NodeResult,
  Outcome,
  PlanInstance,
  Reason,
  ReasonCode,
  StudentState,
  Tri,
  UocRange
} from './eval/types';
export type {
  Bundle,
  CatalogueData,
  CourseEntry,
  PatchStatus,
  ResolvedDoc
} from './resolve/bundle';
export { catalogueFromData, createBundle, staticCatalogue } from './resolve/bundle';
export type { SemanticDoc, SemanticResult } from './validate/semantic';
export { checkDocs, checkFixture } from './validate/semantic';
export type { Client, LoadResult, Method, Port, Request, Response } from './worker';
export { createClient, createHandler, serve } from './worker';
