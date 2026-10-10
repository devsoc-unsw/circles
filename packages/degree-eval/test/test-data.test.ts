import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listTestData, readSource, TEST_DATA } from './helpers/test-data';

describe('vendored test data', () => {
  const source = readSource();

  it('records the validate.mjs counts', () => {
    expect(source.validate.documents).toBeGreaterThan(0);
    expect(source.validate.parsed).toBeGreaterThanOrEqual(source.validate.roundTrips);
  });

  it('holds exactly the files listed in SOURCE.json', () => {
    expect(listTestData()).toEqual(Object.keys(source.files).sort());
  });

  it('matches the SOURCE.json hashes (re-run sync-test-data instead of editing)', () => {
    for (const [rel, hash] of Object.entries(source.files)) {
      const actual = createHash('sha256')
        .update(readFileSync(join(TEST_DATA, rel)))
        .digest('hex');
      expect(actual, rel).toBe(hash);
    }
  });
});
