// Perf budget (EVALUATOR.md §5.6): < 50 ms for a 144 UOC single degree and < 300 ms with
// auto-choice. Run with `npm run bench`; results are recorded in DECISIONS.md.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'vitest';
import YAML from 'yaml';
import { createBundle, evaluate, loadDocuments, staticCatalogue } from '../src';
import type { Fixture } from './helpers/fixtures';
import { loadYaml, TEST_DATA } from './helpers/test-data';

const setup = (fx: Fixture) => {
  const files = [
    ...fx.bundle.documents.map((p) => ({
      path: p,
      text: readFileSync(join(TEST_DATA, p), 'utf8'),
      origin: 'repo' as const
    })),
    ...(fx.bundle.inline ?? []).map((d, i) => ({
      path: `inline-${i}`,
      text: JSON.stringify(d),
      origin: 'local' as const
    }))
  ];
  const load = () => loadDocuments(files);
  const catalogue = staticCatalogue(fx.bundle.catalogue.courses ?? {}, fx.bundle.catalogue.default);
  return { load, bundle: createBundle(load().docs, catalogue) };
};

// median and p95 wall time over `runs` calls, after a warm-up
const time = (label: string, budget: number | undefined, fn: () => void, runs = 50) => {
  for (let i = 0; i < 5; i++) fn();
  const ms = Array.from({ length: runs }, () => {
    const t = performance.now();
    fn();
    return performance.now() - t;
  }).sort((a, b) => a - b);
  const median = ms[Math.floor(runs / 2)] ?? 0;
  const p95 = ms[Math.floor(runs * 0.95)] ?? 0;
  const over = budget === undefined ? '' : ` (budget ${budget} ms)`;
  process.stdout.write(
    `${label}: median ${median.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms${over}\n`
  );
};

describe('perf budget', () => {
  it('3778 + COMPA1 + MATHC2, 144 UOC plan', () => {
    const fx = loadYaml('fixtures/m1-3778-mathc2.yaml') as Fixture;
    const { load, bundle } = setup(fx);
    time('3778: load + validate the documents', undefined, load);
    time('3778: evaluate', 50, () => evaluate(bundle, fx.student));
  });

  it('3409, 144 UOC plan, two choice groups auto-chosen', () => {
    const golden = join(dirname(fileURLToPath(import.meta.url)), 'golden');
    const fx = YAML.parse(
      readFileSync(join(golden, 'g1-3409-prescribed-electives.yaml'), 'utf8')
    ) as Fixture;
    const { bundle } = setup(fx);
    const selections = { ...fx.student.selections };
    delete selections['second-specialisation'];
    time('3409: evaluate with selections', 50, () => evaluate(bundle, fx.student));
    time('3409: evaluate with auto-choice', 300, () =>
      evaluate(bundle, { ...fx.student, selections })
    );
  });
});
