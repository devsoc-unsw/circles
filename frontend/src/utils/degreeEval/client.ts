import { Client, createClient, createLocalClient } from '@circles/degree-eval';

let client: Client | undefined;

// One evaluator per page load: a Web Worker in the browser, in-thread where there is none (tests).
const getEvaluator = (): Client => {
  if (!client) {
    client =
      typeof Worker === 'undefined'
        ? createLocalClient()
        : createClient(
            new Worker(new URL('./worker.ts', import.meta.url), {
              type: 'module'
            })
          );
  }
  return client;
};

export default getEvaluator;
