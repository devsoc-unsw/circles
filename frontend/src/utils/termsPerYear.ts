import { Term } from 'types/planner';
import { TERMS_PER_YEAR } from 'config/constants';

// Number of standard terms (excluding summer term T0) in the given year
export const getTermsPerYear = (year: number): number => {
  const configuredYears = Object.keys(TERMS_PER_YEAR).map(Number);
  const applicableYears = configuredYears.filter((y) => y <= year);
  const effectiveYear = applicableYears.length
    ? Math.max(...applicableYears)
    : Math.min(...configuredYears);
  return TERMS_PER_YEAR[effectiveYear];
};

// Term identifiers for the given year, e.g. ['T1', 'T2', 'T3'].
// The summer term 'T0' is prepended when includeSummer is true.
export const getTermsList = (year: number, includeSummer = false): Term[] => {
  const terms = Array.from({ length: getTermsPerYear(year) }, (_, i) => `T${i + 1}` as Term);
  return includeSummer ? ['T0', ...terms] : terms;
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

// Width of the standard-term area, in grid units, such that every year's terms tile
// it exactly: with both 3-term and 2-term years on screen this is 6, so a term spans
// 2 units and a semester spans 3 and both rows still fill the full width.
export const getTermColumnUnits = (years: number[]): number =>
  years.length ? years.map(getTermsPerYear).reduce(lcm) : 0;

// Grid units a single term of the given year occupies, given the total from
// getTermColumnUnits. Semesters come out wider than terms, rather than leaving a gap.
export const getTermColumnSpan = (year: number, totalUnits: number): number =>
  totalUnits / getTermsPerYear(year);
