import { parseMarkToInt } from "../CourseSelector/utils";

// Recent Past Term Constants
const FEB = 2;
const JUN = 6;
const SEP = 9;
const MID_MONTH_START = 14;
const BEG_MONTH_START = 1;
const TERM_PAST_AMOUNT = 14;

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
      Object.values(term).forEach((course) => {
        coursesData[course] = parseMarkToInt(courses[course].mark);
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

export { getMostRecentPastTerm, prepareCoursesForValidation };
