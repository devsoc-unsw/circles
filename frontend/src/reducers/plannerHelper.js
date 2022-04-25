export const setInLocalStorage = (state) => {
  localStorage.setItem("planner", JSON.stringify(state));
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
