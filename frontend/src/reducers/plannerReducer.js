const dummyMap = new Map();

dummyMap.set("COMP1511", {
  title: "Programming Fundamentals",
  type: "Core",
  termsOffered: ["t1", "t2", "t3"],
  prereqs: [],
});
dummyMap.set("COMP2521", {
  title: "Data Structures and Algorithms",
  type: "Core",
  termsOffered: ["t1", "t2", "t3"],
  prereqs: ["COMP1511"],
});
dummyMap.set("DEFAULT2000", {
  title: "Default course 2",
  type: "Elective",
  termsOffered: ["t1", "t2"],
  prereqs: ["COMP1511"],
});
dummyMap.set("DEFAULT3000", {
  title: "Default course 3",
  type: "General Education",
  termsOffered: ["t2", "t3"],
  prereqs: ["COMP1511"],
});

const plannedCourses = new Map();
// plannedCourses.set("COMP2511", "2021t1");
// plannedCourses.set("COMP1511", "2021t2");

const initialState = {
  unplanned: ["COMP1511", "COMP2521", "DEFAULT2000", "DEFAULT3000"],
  startYear: 2021,
  numYears: 3,
  years: [
    { t1: [], t2: [], t3: [] },
    { t1: [], t2: [], t3: [] },
    { t1: [], t2: [], t3: [] },
  ],
  courses: dummyMap,
  plannedCourses: plannedCourses,
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

      return { ...state, unplanned: newUnplanned };

    case "UPDATE_PLANNED_COURSES":
      //       let plannedCourses = = [];
      //       state.unplanned.forEach((course) => {
      //         if (action.payload != course) newUnplanned.push(course);
      //       });
      //       console.log(newUnplanned);
      const { course, term, warning } = action.payload;
      const plannedClone = new Map(state.plannedCourses).set(course, {
        term: term,
        warning: warning,
      });
      return { ...state, plannedCourses: plannedClone };

    default:
      return state;
  }
};

export default plannerReducer;
