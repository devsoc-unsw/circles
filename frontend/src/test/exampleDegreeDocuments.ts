// Stand-in document source: the circles-schema examples vendored in the package. The agreed design
// is that the backend stores the documents and serves them as YAML text; swap this for that call
// when the endpoint exists. Loaded lazily, so the YAML is only fetched when the flag is on.
import type { SourceFile } from '@circles/degree-eval';

const files = import.meta.glob<string>(
  '../../../../packages/degree-eval/test-data/examples/**/*.yaml',
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
