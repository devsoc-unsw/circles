export const setInLocalStorage = (state) => {
  let stateCopy = Object.assign({}, state);
  const jsonCourses = Array.from(state.courses.entries());
  const jsonPlannedCourses = Array.from(state.plannedCourses.entries());
  const jsonCompletedTerms = Array.from(state.completedTerms.entries());
  const jsonHidden = JSON.stringify(state.hidden);
  stateCopy["courses"] = jsonCourses;
  stateCopy["plannedCourses"] = jsonPlannedCourses;
  stateCopy["completedTerms"] = jsonCompletedTerms;
  stateCopy["hidden"] = jsonHidden;
  stateCopy["areYearsHidden"] = state.areYearsHidden;

  localStorage.setItem("planner", JSON.stringify(stateCopy));
};

export const extractFromLocalStorage = (planner) => {
  let plannerCpy = Object.assign({}, planner);
  const coursesCpy = new Map(planner.courses);
  const plannedCoursesCpy = new Map(planner.plannedCourses);
  const completedTermsCpy = new Map(planner.completedTerms);
  const hiddenCpy = JSON.parse(planner.hidden);
  plannerCpy.courses = coursesCpy;
  plannerCpy.plannerCourses = plannedCoursesCpy;
  plannerCpy.completedTerms = completedTermsCpy;
  plannerCpy.hidden = hiddenCpy;
  plannerCpy.areYearsHidden = planner.areYearsHidden;
  return plannerCpy;
};

export const generateEmptyYears = (nYears) => {
  let res = [];
  for (let i = 0; i < nYears; ++i) {
    const year = { T0: [], T1: [], T2: [], T3: [] };
    res.push(year);
  }
  return res;
};
