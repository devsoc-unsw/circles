import { Grade, Mark, PlannerCourse, Term } from 'types/planner';
import { PlannerResponse } from 'types/userResponse';
import getNumTerms from 'utils/getNumTerms';
import { getTermsList as getYearTermsList } from 'utils/termsPerYear';

const parseMarkToInt = (mark: Mark): number | null => {
  if (typeof mark === 'undefined') return null;
  if (typeof mark === 'string') {
    const letterGradeToIntMap: Record<Grade, number | null> = {
      SY: null,
      FL: 25,
      PS: 55,
      CR: 70,
      DN: 80,
      HD: 90
    };
    return Object.keys(letterGradeToIntMap).includes(mark) ? letterGradeToIntMap[mark] : null;
  }
  return mark;
};

// Checks if no courses have been planned
const isPlannerEmpty = (planner: PlannerResponse) => {
  return planner.years.every((year) =>
    Object.keys(year).every((term) => year[term as Term].length === 0)
  );
};

// How many years a multiterm placement walk may cross before giving up.
// Guards against endless walks when a course's offered terms never exist
// again, e.g. a T3-only course spilling forward past 2028.
const MAX_MULTITERM_YEAR_SPAN = 100;

// Returns a list of terms and rowOffsets that a multiterm course will be added to,
// walking through the terms that exist in each calendar year so that terms which
// don't exist in a given year (e.g. T3 from 2028 onwards) are skipped.
// Returns null if the remaining instances can never be placed.
const getTermsList = (
  destYear: number,
  currentTerm: Term,
  uoc: number,
  availableTerms: Term[],
  isSummerTerm: boolean,
  instanceNum: number
): { term: Term; rowOffset: number }[] | null => {
  const offeredTermsIn = (year: number): Term[] =>
    getYearTermsList(year, isSummerTerm).filter((term) => availableTerms.includes(term));

  const destTerms = offeredTermsIn(destYear);
  if (!destTerms.includes(currentTerm)) return [];

  const termsList: { term: Term; rowOffset: number }[] = [];
  const numTerms = getNumTerms(uoc, true);

  // Walk backwards to place the instances before the dragged one
  let rowOffset = 0;
  let terms = destTerms;
  let index = terms.indexOf(currentTerm) - 1;
  for (let i = 0; i < instanceNum; i++) {
    while (index < 0) {
      rowOffset -= 1;
      if (rowOffset < -MAX_MULTITERM_YEAR_SPAN) return null;
      terms = offeredTermsIn(destYear + rowOffset);
      index = terms.length - 1;
    }
    termsList.unshift({ term: terms[index], rowOffset });
    index -= 1;
  }

  // Walk forwards from the dragged instance
  rowOffset = 0;
  terms = destTerms;
  index = terms.indexOf(currentTerm);
  for (let i = instanceNum; i < numTerms; i++) {
    while (index >= terms.length) {
      rowOffset += 1;
      if (rowOffset > MAX_MULTITERM_YEAR_SPAN) return null;
      terms = offeredTermsIn(destYear + rowOffset);
      index = 0;
    }
    termsList.push({ term: terms[index], rowOffset });
    index += 1;
  }

  return termsList;
};

// Checks whether multiterm course will extend below bottom row of term planner
type MultitermInBoundsPayload = {
  srcTerm: Term | 'unplanned';
  destTerm: Term;
  startYear: number;
  destRow: number;
  course: PlannerCourse;
  isSummerTerm: boolean;
  numYears: number;
};

const checkMultitermInBounds = (payload: MultitermInBoundsPayload) => {
  const { destTerm, course, isSummerTerm, startYear, destRow, numYears, srcTerm } = payload;

  const { UOC: uoc, termsOffered, plannedFor } = course;

  const instanceNum =
    srcTerm === 'unplanned' || !plannedFor ? 0 : plannedFor.split(' ').indexOf(srcTerm);
  const termsList = getTermsList(
    startYear + destRow,
    destTerm,
    uoc,
    termsOffered,
    isSummerTerm,
    instanceNum
  );

  if (!termsList || termsList.length === 0) {
    return false;
  }

  const { rowOffset: maxRowOffset } = termsList[termsList.length - 1];
  const { rowOffset: minRowOffset } = termsList[0];

  return maxRowOffset < numYears - destRow && minRowOffset + destRow >= 0;
};

export { checkMultitermInBounds, getNumTerms, getTermsList, isPlannerEmpty, parseMarkToInt };
