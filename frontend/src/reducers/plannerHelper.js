export const setInLocalStorage = (state) => {
  const stateCopy = { ...state };
  const jsonCourses = Array.from(state.courses.entries());
  const jsonPlannedCourses = Array.from(state.plannedCourses.entries());
  const jsonCompletedTerms = Array.from(state.completedTerms.entries());
  const jsonHidden = JSON.stringify(state.hidden);
  stateCopy.courses = jsonCourses;
  stateCopy.plannedCourses = jsonPlannedCourses;
  stateCopy.completedTerms = jsonCompletedTerms;
  stateCopy.hidden = jsonHidden;
  stateCopy.areYearsHidden = state.areYearsHidden;

  localStorage.setItem("planner", JSON.stringify(stateCopy));
};

export const extractFromLocalStorage = (planner) => {
  const plannerCpy = { ...planner };
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
  const res = [];
  for (let i = 0; i < nYears; i++) {
    res.push({
      T0: [], T1: [], T2: [], T3: [],
    });
  }
  return res;
};
