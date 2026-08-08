import {
  getTermColumnSpan,
  getTermColumnUnits,
  getTermsList,
  getTermsPerYear
} from './termsPerYear';

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

describe('getTermColumnUnits', () => {
  it('uses one unit per term when every year has the same term count', () => {
    expect(getTermColumnUnits([2025, 2026, 2027])).toEqual(3);
    expect(getTermColumnUnits([2028, 2029])).toEqual(2);
  });

  it('subdivides so 3-term and 2-term years tile the same width', () => {
    expect(getTermColumnUnits([2027, 2028])).toEqual(6);
  });

  it('returns no units when there are no years', () => {
    expect(getTermColumnUnits([])).toEqual(0);
  });
});

describe('getTermColumnSpan', () => {
  it("splits the term area evenly among a year's terms", () => {
    expect(getTermColumnSpan(2027, 3)).toEqual(1);
    expect(getTermColumnSpan(2028, 2)).toEqual(1);
  });

  it('makes semesters wider than terms when both are on screen', () => {
    const units = getTermColumnUnits([2027, 2028]);
    expect(getTermColumnSpan(2027, units)).toEqual(2);
    expect(getTermColumnSpan(2028, units)).toEqual(3);
  });

  it('has every year fill the full term area', () => {
    const units = getTermColumnUnits([2027, 2028]);
    expect(getTermColumnSpan(2027, units) * 3).toEqual(units);
    expect(getTermColumnSpan(2028, units) * 2).toEqual(units);
  });
});
