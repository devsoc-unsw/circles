// Runs a §15 fixture against the vendored test data and asserts it passes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect } from 'vitest';
import type { Evaluation, Fixture } from '../../src';
import { compareFixture, formatDiagnostic, runFixture as run } from '../../src';
import { TEST_DATA } from './test-data';

export type { Fixture } from '../../src';

const read = (path: string) => {
  try {
    return readFileSync(join(TEST_DATA, path), 'utf8');
  } catch {
    return undefined;
  }
};

export const runFixture = (fx: Fixture): Evaluation => {
  const { evaluation, diagnostics } = run(fx, read);
  expect(diagnostics.filter((d) => d.level === 'error').map(formatDiagnostic)).toEqual([]);
  return evaluation;
};

export const checkFixture = (fx: Fixture): Evaluation => {
  const ev = runFixture(fx);
  expect(compareFixture(fx, ev)).toEqual([]);
  return ev;
};
