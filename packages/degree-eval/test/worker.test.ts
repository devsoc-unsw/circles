// Worker wrapper (EVALUATOR.md §5.6), driven over a real MessageChannel so every message goes
// through structured clone, as it would between a page and a Web Worker.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MessageChannel } from 'node:worker_threads';
import { afterAll, describe, expect, it } from 'vitest';
import type { CourseFacts, Port, StudentState } from '../src';
import {
  createBundle,
  createClient,
  createLocalClient,
  evaluate,
  loadDocuments,
  serve,
  staticCatalogue
} from '../src';
import type { Fixture } from './helpers/fixtures';
import { loadYaml, TEST_DATA } from './helpers/test-data';

const asPort = (p: InstanceType<typeof MessageChannel>['port1']): Port => ({
  postMessage: (m) => p.postMessage(m),
  addEventListener: (_type, listener) => p.on('message', (data: unknown) => listener({ data }))
});

const fx = loadYaml('fixtures/m1-3778-mathc2.yaml') as Fixture;
const files = fx.bundle.documents.map((p) => ({
  path: p,
  text: readFileSync(join(TEST_DATA, p), 'utf8'),
  origin: 'repo' as const
}));
const courses: CourseFacts[] = Object.entries(fx.bundle.catalogue.courses ?? {}).map(
  ([code, { gened, ...f }]) => ({ ...f, code, ...(gened === undefined ? {} : { gen_ed: gened }) })
);

const channel = new MessageChannel();
serve(asPort(channel.port1));
const client = createClient(asPort(channel.port2));
afterAll(() => {
  channel.port1.close();
  channel.port2.close();
});

describe('worker protocol', () => {
  it('rejects calls before documents are loaded', async () => {
    await expect(client.evaluate({ student: fx.student })).rejects.toThrow('no documents loaded');
  });

  it('loads, evaluates and answers follow-up calls like the in-thread API', async () => {
    const loaded = await client.load({
      files,
      catalogue: {
        courses,
        ...(fx.bundle.catalogue.default ? { default: fx.bundle.catalogue.default } : {})
      }
    });
    expect(loaded.diagnostics.filter((d) => d.level === 'error')).toEqual([]);

    expect(
      await client.assignSpecs({ program: '3778', year: 2026, codes: ['COMPA1', 'MATHC2'] })
    ).toEqual({ selections: { major: ['COMPA1'], minor: ['MATHC2'] }, unplaced: [] });

    const ev = await client.evaluate({ student: fx.student });
    const local = evaluate(
      createBundle(
        loadDocuments(files).docs,
        staticCatalogue(fx.bundle.catalogue.courses ?? {}, fx.bundle.catalogue.default)
      ),
      fx.student
    );
    expect(ev.nodes).toBeInstanceOf(Map);
    expect(ev.root).toEqual(local.root);
    expect([...ev.nodes]).toEqual([...local.nodes]);
    expect(ev.notCounted).toEqual(local.notCounted);

    const iid = fx.student.plan[0]?.iid ?? '';
    expect((await client.checkInstance({ iid })).status).toBeDefined();
    const unlocked = await client.unlockedAt({ term: 2, codes: ['COMP2521'] });
    expect(unlocked.get('COMP2521')?.status).toBeDefined();
    expect(Array.isArray(await client.explain({ target: { path: 'root' } }))).toBe(true);
  });

  it('reports an error for one call and keeps answering', async () => {
    const bad: StudentState = { program: 'nope', year: 2026, plan: [] };
    const ev = await client.evaluate({ student: bad });
    expect(ev.root.status).toBe('unknown');
    await expect(client.unlockedAt({ term: 1, codes: ['COMP1511'] })).rejects.toThrow(
      'not an Evaluation'
    );
    expect((await client.evaluate({ student: fx.student })).root.status).toBeDefined();
  });

  it('has an in-thread client with the same API', async () => {
    const local = createLocalClient();
    await expect(local.evaluate({ student: fx.student })).rejects.toThrow('no documents loaded');
    await local.load({ files, catalogue: { courses } });
    const ev = await local.evaluate({ student: fx.student });
    expect(ev.root.status).toBe((await client.evaluate({ student: fx.student })).root.status);
  });
});
