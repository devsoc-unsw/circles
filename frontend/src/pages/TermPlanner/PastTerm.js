// Recent Past Term Constants
const FEB = 1;
const JUN = 5;
const SEP = 8;
const MID_MONTH_START = 14;
const BEG_MONTH_START = 1;
const TERM_PAST_AMOUNT = 14;

// takes in startYear (int) and gets current date to return the most recent term that has past (week 2)
// dictionary of year in degree and term most recent is returned 
export const getMostRecentPastTerm = (startYear) => {
  let currTime = new Date();
  let currYear = currTime.getFullYear();
  let currMonth = currTime.getMonth();
  let currDay = currTime.getDate();
  const currDegreeYear = currYear - startYear + 1;

  // session dates gathered from: https://www.student.unsw.edu.au/teaching-periods
  let lastTermPast;
  if ((currDay >= MID_MONTH_START + TERM_PAST_AMOUNT && currMonth === SEP) || currMonth > SEP) {
    lastTermPast = 3;
  } else if ((currDay >= BEG_MONTH_START + TERM_PAST_AMOUNT && currMonth === JUN) || currMonth > JUN) {
    lastTermPast = 2;
  } else if ((currDay >= MID_MONTH_START + TERM_PAST_AMOUNT && currMonth === FEB) || currMonth > FEB) {
    lastTermPast = 1;
  } else {
    lastTermPast = 0;
  }

  return {
    "Y": currDegreeYear,
    "T": lastTermPast,
  };
};