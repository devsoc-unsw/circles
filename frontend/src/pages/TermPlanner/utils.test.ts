import { Course } from 'types/api';
import { Term } from 'types/planner';
import { badCourseInfo } from 'types/userResponse';
import { LIVE_YEAR } from 'config/constants';
import {
  checkMultitermInBounds,
  extrapolateCourseYears,
  getMultitermInstanceNum,
  getTermsList
} from './utils';

// Placements must walk through the terms that exist in each calendar year
// (3 standard terms before 2028, 2 from 2028 onwards), skipping terms that
// do not exist in a given year.
describe('getTermsList', () => {
  it('spills within a 3-term year', () => {
    expect(getTermsList(2026, 'T1', 2, ['T1', 'T2', 'T3'], false, 0)).toEqual([
      { term: 'T1', rowOffset: 0 },
      { term: 'T2', rowOffset: 0 },
      { term: 'T3', rowOffset: 0 }
    ]);
  });

  it('skips T3 in a 2-term year and wraps to the next year', () => {
    expect(getTermsList(2028, 'T1', 2, ['T1', 'T2', 'T3'], false, 0)).toEqual([
      { term: 'T1', rowOffset: 0 },
      { term: 'T2', rowOffset: 0 },
      { term: 'T1', rowOffset: 1 }
    ]);
  });

  it('spills forward across the 2027 to 2028 boundary', () => {
    expect(getTermsList(2027, 'T3', 2, ['T1', 'T2', 'T3'], false, 0)).toEqual([
      { term: 'T3', rowOffset: 0 },
      { term: 'T1', rowOffset: 1 },
      { term: 'T2', rowOffset: 1 }
    ]);
  });

  it('walks backwards into a 2-term year without using T3', () => {
    expect(getTermsList(2029, 'T1', 2, ['T1', 'T2', 'T3'], false, 1)).toEqual([
      { term: 'T2', rowOffset: -1 },
      { term: 'T1', rowOffset: 0 },
      { term: 'T2', rowOffset: 0 }
    ]);
  });

  it('includes the summer term when enabled', () => {
    expect(getTermsList(2028, 'T2', 2, ['T0', 'T1', 'T2'], true, 0)).toEqual([
      { term: 'T2', rowOffset: 0 },
      { term: 'T0', rowOffset: 1 },
      { term: 'T1', rowOffset: 1 }
    ]);
  });

  it('returns an empty list when the current term is not offered', () => {
    expect(getTermsList(2026, 'T1', 2, ['T2', 'T3'], false, 0)).toEqual([]);
  });

  it('returns an empty list when the current term does not exist in the year', () => {
    expect(getTermsList(2028, 'T3', 2, ['T1', 'T2', 'T3'], false, 0)).toEqual([]);
  });

  it('returns null when remaining instances can never be placed', () => {
    // A course offered only in T3 can never spill forward past 2027
    expect(getTermsList(2027, 'T3', 3, ['T3'], false, 0)).toBeNull();
  });
});

// Mirrors the backend's instance derivation in plannedToTerm: collect the terms
// containing the course in row-major T0-T3 order, then index the source term name.
describe('getMultitermInstanceNum', () => {
  const emptyYear = (): Record<string, string[]> => ({ T0: [], T1: [], T2: [], T3: [] });

  it('returns 0 when the source term holds the first instance', () => {
    const years = [{ ...emptyYear(), T1: ['COMP1511'], T2: ['COMP1511'] }];
    expect(getMultitermInstanceNum(years, 'COMP1511', 'T1')).toBe(0);
  });

  it('returns the index of a later instance in the same year', () => {
    const years = [{ ...emptyYear(), T1: ['COMP1511'], T2: ['COMP1511'] }];
    expect(getMultitermInstanceNum(years, 'COMP1511', 'T2')).toBe(1);
  });

  it('counts instances across years in row order', () => {
    const years = [
      { ...emptyYear(), T3: ['COMP1511'] },
      { ...emptyYear(), T1: ['COMP1511'] }
    ];
    expect(getMultitermInstanceNum(years, 'COMP1511', 'T1')).toBe(1);
  });

  it('walks terms in T0-T3 order regardless of object key order', () => {
    const years = [{ T2: ['COMP1511'], T1: ['COMP1511'], T3: [], T0: [] }];
    expect(getMultitermInstanceNum(years, 'COMP1511', 'T2')).toBe(1);
  });
});

describe('checkMultitermInBounds', () => {
  const basePayload = {
    startYear: 2027,
    destRow: 0,
    destTerm: 'T3' as Term,
    instanceNum: 0,
    uoc: 2,
    termsOffered: ['T1', 'T2', 'T3'] as Term[],
    isSummerTerm: false,
    numYears: 2
  };

  it('accepts a spill that fits inside the planner', () => {
    expect(checkMultitermInBounds(basePayload)).toBe(true);
  });

  it('rejects a spill that extends past the last planner year', () => {
    expect(checkMultitermInBounds({ ...basePayload, numYears: 1 })).toBe(false);
  });

  it('rejects a drop into a term that does not exist in its year', () => {
    expect(checkMultitermInBounds({ ...basePayload, startYear: 2028, numYears: 10 })).toBe(false);
  });

  it('rejects a course whose instances can never be placed', () => {
    expect(
      checkMultitermInBounds({
        ...basePayload,
        uoc: 3,
        termsOffered: ['T3'],
        numYears: 10
      })
    ).toBe(false);
  });
});

const makeCourse = (overrides: Partial<Course> = {}): Course => ({
  ...badCourseInfo,
  code: 'COMP1531',
  ...overrides
});

describe('extrapolateCourseYears', () => {
  it('propagates the live-year groupwork value to archive years', () => {
    const validYears = [LIVE_YEAR - 2, LIVE_YEAR - 1, LIVE_YEAR];
    // Only the live year carries real data (with groupwork); archive years are absent
    // and would otherwise inherit whatever the live year's groupwork happens to be.
    const data = { [LIVE_YEAR]: makeCourse({ groupwork: true, terms: ['T1'] }) };

    const result = extrapolateCourseYears(data, validYears);

    validYears.forEach((year) => {
      expect(result[year].groupwork).toBe(true);
    });
  });

  it('propagates groupwork=false to every year', () => {
    const validYears = [LIVE_YEAR - 1, LIVE_YEAR];
    const data = {
      [LIVE_YEAR - 1]: makeCourse({ groupwork: true }), // stale archive value
      [LIVE_YEAR]: makeCourse({ groupwork: false })
    };

    const result = extrapolateCourseYears(data, validYears);

    // The live year is authoritative, so the stale archive value is overwritten.
    validYears.forEach((year) => {
      expect(result[year].groupwork).toBe(false);
    });
  });

  it('does not overwrite archive years when the live year has no groupwork field', () => {
    const validYears = [LIVE_YEAR - 1, LIVE_YEAR];
    // Simulates older cached data from before the groupwork field existed: the live
    // year's course has groupwork === undefined, so the guard should skip propagation
    // and leave each year's own value alone.
    const data = {
      [LIVE_YEAR - 1]: makeCourse({ groupwork: true }),
      [LIVE_YEAR]: makeCourse({ groupwork: undefined })
    };

    const result = extrapolateCourseYears(data, validYears);

    expect(result[LIVE_YEAR - 1].groupwork).toBe(true);
    expect(result[LIVE_YEAR].groupwork).toBeUndefined();
  });
});
