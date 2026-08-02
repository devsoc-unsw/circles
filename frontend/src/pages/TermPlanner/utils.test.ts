import { PlannerCourse, Term } from 'types/planner';
import { checkMultitermInBounds, getTermsList } from './utils';

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

describe('checkMultitermInBounds', () => {
  const multitermCourse = (termsOffered: Term[], uoc: number): PlannerCourse => ({
    title: 'Multiterm Course',
    termsOffered,
    UOC: uoc,
    plannedFor: null,
    prereqs: '',
    isLegacy: false,
    isUnlocked: true,
    warnings: [],
    handbookNote: '',
    isAccurate: true,
    ignoreFromProgression: false,
    isMultiterm: true,
    mark: null
  });

  it('accepts a spill that fits inside the planner', () => {
    expect(
      checkMultitermInBounds({
        startYear: 2027,
        destRow: 0,
        destTerm: 'T3',
        srcTerm: 'unplanned',
        course: multitermCourse(['T1', 'T2', 'T3'], 2),
        isSummerTerm: false,
        numYears: 2
      })
    ).toBe(true);
  });

  it('rejects a spill that extends past the last planner year', () => {
    expect(
      checkMultitermInBounds({
        startYear: 2027,
        destRow: 0,
        destTerm: 'T3',
        srcTerm: 'unplanned',
        course: multitermCourse(['T1', 'T2', 'T3'], 2),
        isSummerTerm: false,
        numYears: 1
      })
    ).toBe(false);
  });

  it('rejects a course whose instances can never be placed', () => {
    expect(
      checkMultitermInBounds({
        startYear: 2027,
        destRow: 0,
        destTerm: 'T3',
        srcTerm: 'unplanned',
        course: multitermCourse(['T3'], 3),
        isSummerTerm: false,
        numYears: 10
      })
    ).toBe(false);
  });
});
