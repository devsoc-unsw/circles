import { parseCondition, SCHEMA_VERSION } from '@circles/degree-eval';

describe('@circles/degree-eval', () => {
  it('resolves the package', () => {
    expect(SCHEMA_VERSION).toEqual('1.0');
  });

  it('parses a compact condition', () => {
    expect(parseCondition('COMP1511 and COMP1521')).toEqual({ and: ['COMP1511', 'COMP1521'] });
  });
});
