// Web Worker wrapper (EVALUATOR.md §5.6). `serve` runs inside the worker and keeps the bundle and
// the latest evaluation; `createClient` runs on the page and turns requests into promises. All
// messages are plain structured-clone data (Maps included), so the same code also works over a
// MessageChannel, or in-thread with `createHandler` where no Worker exists (tests, Node).
import type { ExplainEvent } from '../eval/evaluate';
import { checkInstance, evaluate, explain, unlockedAt } from '../eval/evaluate';
import type { SpecAssignment } from '../eval/specs';
import { assignSpecs } from '../eval/specs';
import type { ConditionResult, Evaluation, StudentState } from '../eval/types';
import type { Diagnostic, SourceFile } from '../load';
import { loadDocuments } from '../load';
import type { Bundle, CatalogueData, PatchStatus } from '../resolve/bundle';
import { catalogueFromData, createBundle } from '../resolve/bundle';

export interface LoadResult {
  diagnostics: Diagnostic[];
  patches: PatchStatus[];
}

interface Calls {
  load: { args: { files: SourceFile[]; catalogue: CatalogueData }; result: LoadResult };
  assignSpecs: {
    args: { program: string; year: number; codes: string[] };
    result: SpecAssignment;
  };
  evaluate: { args: { student: StudentState; trace?: boolean }; result: Evaluation };
  checkInstance: { args: { iid: string }; result: ConditionResult };
  unlockedAt: { args: { term: number; codes: string[] }; result: Map<string, ConditionResult> };
  explain: { args: { target: { path: string } | { iid: string } }; result: ExplainEvent[] };
}
export type Method = keyof Calls;

export type Request = {
  [M in Method]: { id: number; method: M; args: Calls[M]['args'] };
}[Method];
export type Response =
  | { id: number; ok: true; result: Calls[Method]['result'] }
  | { id: number; ok: false; error: string };

// the part of a Worker, a worker's global scope or a MessagePort that this module uses
export interface Port {
  postMessage(message: unknown): void;
  addEventListener(type: 'message', listener: (event: { data: unknown }) => void): void;
}

export const createHandler = () => {
  let bundle: Bundle | undefined;
  let last: Evaluation | undefined;
  const needs = <T>(x: T | undefined, what: string): T => {
    if (x === undefined) throw new Error(`no ${what} yet`);
    return x;
  };
  const run = (req: Request): Calls[Method]['result'] => {
    switch (req.method) {
      case 'load': {
        const { docs, diagnostics } = loadDocuments(req.args.files);
        bundle = createBundle(docs, catalogueFromData(req.args.catalogue));
        last = undefined;
        return {
          diagnostics: [...diagnostics, ...bundle.diagnostics],
          patches: bundle.patchReport()
        };
      }
      case 'assignSpecs':
        return assignSpecs(
          needs(bundle, 'documents loaded'),
          req.args.program,
          req.args.year,
          req.args.codes
        );
      case 'evaluate':
        last = evaluate(needs(bundle, 'documents loaded'), req.args.student, {
          trace: req.args.trace === true
        });
        return last;
      case 'checkInstance':
        return checkInstance(needs(last, 'evaluation'), req.args.iid);
      case 'unlockedAt':
        return unlockedAt(needs(last, 'evaluation'), req.args.term, req.args.codes);
      case 'explain':
        return explain(needs(last, 'evaluation'), req.args.target);
      default:
        throw new Error(`unknown method ${String((req as { method: unknown }).method)}`);
    }
  };
  return (req: Request): Response => {
    try {
      return { id: req.id, ok: true, result: run(req) };
    } catch (e) {
      return { id: req.id, ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };
};

// Inside the worker: `serve(self)`.
export const serve = (port: Port): void => {
  const handle = createHandler();
  port.addEventListener('message', (event) => port.postMessage(handle(event.data as Request)));
};

export type Client = {
  [M in Method]: (args: Calls[M]['args']) => Promise<Calls[M]['result']>;
};

// On the page: `createClient(new Worker(...))`. Requests are answered in order.
export const createClient = (port: Port): Client => {
  let next = 0;
  const pending = new Map<number, { resolve: (r: never) => void; reject: (e: Error) => void }>();
  port.addEventListener('message', (event) => {
    const res = event.data as Response;
    const p = pending.get(res.id);
    if (!p) return;
    pending.delete(res.id);
    if (res.ok) p.resolve(res.result as never);
    else p.reject(new Error(res.error));
  });
  const call =
    <M extends Method>(method: M) =>
    (args: Calls[M]['args']) =>
      new Promise<Calls[M]['result']>((resolve, reject) => {
        next += 1;
        pending.set(next, { resolve, reject });
        port.postMessage({ id: next, method, args });
      });
  return {
    load: call('load'),
    assignSpecs: call('assignSpecs'),
    evaluate: call('evaluate'),
    checkInstance: call('checkInstance'),
    unlockedAt: call('unlockedAt'),
    explain: call('explain')
  };
};

// The same promise API without a worker, for environments that have none (tests, Node scripts).
export const createLocalClient = (): Client => {
  const handle = createHandler();
  let next = 0;
  const call =
    <M extends Method>(method: M) =>
    async (args: Calls[M]['args']): Promise<Calls[M]['result']> => {
      next += 1;
      const res = handle({ id: next, method, args } as Request);
      if (!res.ok) throw new Error(res.error);
      return res.result;
    };
  return {
    load: call('load'),
    assignSpecs: call('assignSpecs'),
    evaluate: call('evaluate'),
    checkInstance: call('checkInstance'),
    unlockedAt: call('unlockedAt'),
    explain: call('explain')
  };
};
