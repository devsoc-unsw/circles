import { Course } from 'types/api';
import { badCourseInfo } from 'types/userResponse';
import { LIVE_YEAR } from 'config/constants';
import { extrapolateCourseYears } from './utils';

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
