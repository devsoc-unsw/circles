const MIN_COMPLETED_COURSE_UOC = 6;

// Calculated lcm(uoc, MIN_COMPLETED_COURSE_UOC) to determine number of times course must be taken.
// e.g. 2 UOC course must be taken 3 times, 3 UOC course must be take 2 times
const getNumTerms = (uoc: number, isMultiterm: boolean) => {
  if (!isMultiterm) return 1;
  let num1 = uoc;
  let num2 = MIN_COMPLETED_COURSE_UOC;
  while (num2) {
    const tempNum = num2;
    num2 = num1 % num2;
    num1 = tempNum;
  }
  return MIN_COMPLETED_COURSE_UOC / num1;
};

export default getNumTerms;
