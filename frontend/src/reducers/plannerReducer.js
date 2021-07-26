const dummyMap = new Map();
dummyMap.set("DEFAULT1000", {
  title: "Default course 1",
  type: "Core",
  termsOffered: ["t1", "t2"],
});
dummyMap.set("DEFAULT2000", {
  title: "Default course 2",
  type: "Elective",
  termsOffered: ["t1", "t2"],
});
dummyMap.set("DEFAULT3000", {
  title: "Default course 3",
  type: "General Education",
  termsOffered: ["t2", "t3"],
});

const initialState = {
  unplanned: ["DEFAULT1000", "DEFAULT2000", "DEFAULT3000"],
  startYear: 2021,
  numYears: 3,
  years: [
    { t1: [], t2: [], t3: [] },
    { t1: [], t2: [], t3: [] },
    { t1: [], t2: [], t3: [] },
  ],
  courses: dummyMap,
};
const plannerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_TO_UNPLANNED":
      const { courseCode, courseData } = action.payload;
      // Add course data to courses
      if (!state.courses[courseCode]) {
        state.courses.set(courseCode, courseData);
      }

      // Append course code onto unplanned
      state.unplanned.join(courseCode);
      return state;
    default:
      return state;
  }
};

export default plannerReducer;
