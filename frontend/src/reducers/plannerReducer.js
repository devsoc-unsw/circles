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
dummyMap.set("DEFAULT4000", {
  title: "Default course 1",
  type: "Core",
  termsOffered: ["t1", "t2"],
});
dummyMap.set("DEFAULT5000", {
  title: "Default course 2",
  type: "Elective",
  termsOffered: ["t1", "t2"],
});
dummyMap.set("DEFAULT6000", {
  title: "Default course 3",
  type: "General Education",
  termsOffered: ["t2", "t3"],
});
dummyMap.set("DEFAULT7000", {
  title: "Default course 1",
  type: "Core",
  termsOffered: ["t1", "t2"],
});
dummyMap.set("DEFAULT8000", {
  title: "Default course 2",
  type: "Elective",
  termsOffered: ["t1", "t2"],
});
dummyMap.set("DEFAULT9000", {
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

    case "SET_YEARS":
      return { ...state, years: action.payload };

    case "SET_UNPLANNED":
      let newUnplanned = [];
      state.unplanned.forEach((course) => {
        if (action.payload != course) newUnplanned.push(course);
      });
      console.log(newUnplanned);

      return { ...state, unplanned: newUnplanned };

            // Append course code onto unplanned
            state.unplanned.join(courseCode)
            console.log(state)
            return state;
        case 'REMOVE_ALL_UNPLANNED':
            return { ...state, unplanned: action.payload };
        default: 
            return state; 
    }
}

export default plannerReducer;
