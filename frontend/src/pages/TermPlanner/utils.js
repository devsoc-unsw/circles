// Recent Past Term Constants
const FEB = 2;
const JUN = 6;
const SEP = 9;
const MID_MONTH_START = 14;
const BEG_MONTH_START = 1;
const TERM_PAST_AMOUNT = 14;
const MIN_COMPLETED_COURSE_UOC = 6;

const parseMarkToInt = (mark) => {
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(mark)) {
    return parseInt(mark, 10);
  }
  const letterGradeToIntMap = {
    SY: null,
    FL: 25,
    PS: 60,
    CR: 70,
    DN: 80,
    HD: 90,
  };
  return Object.keys(letterGradeToIntMap).includes(mark) ? letterGradeToIntMap[mark] : null;
};

// takes in startYear (int) and gets current date to
// return the most recent term that has past (week 2)
// dictionary of year in degree and term most recent is returned
const getMostRecentPastTerm = (startYear) => {
  const currTime = new Date();
  const currYear = currTime.getFullYear();
  const currMonth = currTime.getMonth();
  const currDay = currTime.getDate();
  const currDegreeYear = currYear - startYear + 1;

  const pastStart = (monthStart, month) => (
    (currDay >= monthStart + TERM_PAST_AMOUNT && currMonth === month) || currMonth > month
  );

  // session dates gathered from: https://www.student.unsw.edu.au/teaching-periods
  let lastTermPast;
  if (pastStart(MID_MONTH_START, SEP)) {
    lastTermPast = 3;
  } else if (pastStart(BEG_MONTH_START, JUN)) {
    lastTermPast = 2;
  } else if (pastStart(MID_MONTH_START, FEB)) {
    lastTermPast = 1;
  } else {
    lastTermPast = 0;
  }

  return {
    Y: currDegreeYear,
    T: lastTermPast,
  };
};

const prepareCoursesForValidation = (planner, degree, showWarnings) => {
  const { years, startYear, courses } = planner;
  const { programCode, specs } = degree;

  const plan = [];
  years.forEach((year) => {
    const formattedYear = [];
    Object.values(year).forEach((term) => {
      const coursesData = {};
      Object.values(term).forEach((c) => {
        coursesData[c] = parseMarkToInt(courses[c].mark);
      });
      formattedYear.push(coursesData);
    });
    plan.push(formattedYear);
  });

  const payload = {
    program: programCode,
    specialisations: specs,
    year: 1,
    plan,
    mostRecentPastTerm: showWarnings ? { Y: 0, T: 0 } : getMostRecentPastTerm(startYear),
  };

  return payload;
};

// Calculated lcm(uoc, MIN_COMPLETED_COURSE_UOC) to determine number of times course must be taken.
// e.g. 2 UOC course must be taken 3 times, 3 UOC course must be take 2 times
const getNumTerms = (uoc) => {
  let num1 = uoc;
  let num2 = MIN_COMPLETED_COURSE_UOC;
  while (num2) {
    const tempNum = num2;
    num2 = num1 % num2;
    num1 = tempNum;
  }
  return MIN_COMPLETED_COURSE_UOC / num1;
};

// Returns a list of terms and rowOffsets that multiterm course will be added to
const getTermsList = (currentTerm, uoc, availableTerms, summerTerm, instanceNum) => {
  const allTerms = ["T1", "T2", "T3"];
  const termsList = [];

  if (summerTerm) allTerms.unshift("T0");

  // Remove any unavailable terms
  const terms = allTerms.filter((term) => availableTerms.includes(term));

  let index = terms.indexOf(currentTerm);
  let rowOffset = 0;
  const numTerms = getNumTerms(uoc);

  for (let i = 0; i < instanceNum; i++) {
    if (index <= 0) {
      index = terms.length - 1;
      rowOffset -= 1;
    }

    termsList.unshift({
      term: terms[(index + terms.length - 1) % 3],
      rowOffset,
    });

    index -= 1;
  }

  rowOffset = 0;
  index = terms.indexOf(currentTerm);

  for (let i = instanceNum; i < numTerms; i++) {
    if (index === terms.length) {
      index = 0;
      rowOffset += 1;
    }

    termsList.push({
      term: terms[index],
      rowOffset,
    });

    index += 1;
  }

  return termsList;
};

const getCurrentTermId = (originalTermId, term, yearOffset) => {
  const year = parseInt(originalTermId.slice(0, 4), 10) + yearOffset;
  return `${year}${term}`;
};

// Checks whether multiterm course will extend below bottom row of term planner
const checkMultitermInBounds = (payload) => {
  const {
    destTerm, course, isSummerTerm, destRow, numYears, srcTerm,
  } = payload;

  const { UOC: uoc, termsOffered, plannedFor } = course;

  if (!termsOffered.includes(destTerm)) {
    return false;
  }

  const instanceNum = srcTerm === "unplanned" ? 0 : plannedFor.split(" ").indexOf(srcTerm);
  const termsList = getTermsList(destTerm, uoc, termsOffered, isSummerTerm, instanceNum);

  const { rowOffset: maxRowOffset } = termsList[termsList.length - 1];
  const { rowOffset: minRowOffset } = termsList[0];

  return (maxRowOffset < numYears - destRow) && (minRowOffset + destRow >= 0);
};

// Checks whether a course is a multiterm course
const checkIsMultiterm = (course, courses) => courses[course].isMultiterm;

export {
  checkIsMultiterm,
  checkMultitermInBounds,
  getCurrentTermId,
  getMostRecentPastTerm,
  getTermsList,
  parseMarkToInt,
  prepareCoursesForValidation,
};
