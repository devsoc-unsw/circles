// Recent Past Term Constants
const FEB = 2;
const JUN = 6;
const SEP = 9;
const MID_MONTH_START = 14;
const BEG_MONTH_START = 1;
const TERM_PAST_AMOUNT = 14;

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

const prepareCoursesForValidation = (planner, degree, suppress) => {
  const { years, startYear, courses } = planner;
  const { programCode, majors, minor } = degree;

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
    specialisations: minor ? [...majors, minor] : majors,
    year: 1,
    plan,
    mostRecentPastTerm: suppress ? getMostRecentPastTerm(startYear) : { Y: 0, T: 0 },
  };

  return payload;
};

// Calculated lcm(uoc, 6) to determine number of times course must be taken.
// e.g. 2 UOC course must be taken 3 times, 3 UOC course must be take 1 time
const getNumTerms = (uoc) => {
  let num1 = uoc;
  let num2 = 6;
  while (num2) {
    const tempNum = num2;
    num2 = num1 % num2;
    num1 = tempNum;
  }
  console.log(uoc, num1);
  console.log("GOT", num1);
  return 6 / num1;
};

const getTermsList = (currentTerm, uoc, summerTerm) => {
  const terms = ["T1", "T2", "T3"];
  const termsList = [];

  if (summerTerm) terms.shift("T0");

  let index = terms.indexOf(currentTerm);
  let rowOffset = 0;
  const numTerms = getNumTerms(uoc);
  for (let i = 0; i < numTerms; i++) {
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
  console.log(`${originalTermId} -> ${year}${term}`);
  return `${year}${term}`;
};

export {
  getCurrentTermId,
  getMostRecentPastTerm,
  getTermsList,
  parseMarkToInt,
  prepareCoursesForValidation,
};
