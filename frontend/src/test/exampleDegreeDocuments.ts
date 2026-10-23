// Test fixtures: the circles-schema examples vendored in the package, as the backend would serve
// them (GET /degrees/documents). Tests use these fixed copies so that edits to the backend's
// documents do not change test expectations.
import type { SourceFile } from '@circles/degree-eval';

const files = import.meta.glob<string>(
  '../../../packages/degree-eval/test-data/examples/**/*.yaml',
  { query: '?raw', import: 'default' }
);

const loadExampleDocuments = async (): Promise<SourceFile[]> =>
  Promise.all(
    Object.entries(files)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(async ([path, load]) => ({
        path: path.replace(/^.*\/test-data\//, ''),
        text: await load(),
        origin: 'repo' as const
      }))
  );

export default loadExampleDocuments;
