import { getTermsList, getTermsPerYear } from './termsPerYear';

describe('getTermsPerYear', () => {
  it('returns 3 terms for years before 2028', () => {
    expect(getTermsPerYear(2019)).toEqual(3);
    expect(getTermsPerYear(2026)).toEqual(3);
    expect(getTermsPerYear(2027)).toEqual(3);
  });

  it('returns 2 terms from 2028 onwards', () => {
    expect(getTermsPerYear(2028)).toEqual(2);
    expect(getTermsPerYear(2035)).toEqual(2);
  });

  it('falls back to the earliest configured value for years before it', () => {
    expect(getTermsPerYear(2015)).toEqual(3);
  });
});

describe('getTermsList', () => {
  it('returns trimester terms for years before 2028', () => {
    expect(getTermsList(2026)).toEqual(['T1', 'T2', 'T3']);
    expect(getTermsList(2026, true)).toEqual(['T0', 'T1', 'T2', 'T3']);
  });

  it('returns semester terms from 2028 onwards', () => {
    expect(getTermsList(2028)).toEqual(['T1', 'T2']);
    expect(getTermsList(2028, true)).toEqual(['T0', 'T1', 'T2']);
  });
});
