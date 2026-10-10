import { SCHEMA_VERSION } from '@circles/degree-eval';

describe('@circles/degree-eval', () => {
  it('resolves the package', () => {
    expect(SCHEMA_VERSION).toEqual('1.0');
  });
});
