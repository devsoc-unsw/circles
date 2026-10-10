import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '../src';

describe('package entry point', () => {
  it('exports the supported schema version', () => {
    expect(SCHEMA_VERSION).toBe('1.0');
  });
});
