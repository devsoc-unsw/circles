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
