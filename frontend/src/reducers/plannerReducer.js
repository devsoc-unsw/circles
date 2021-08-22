const dummyMap = new Map();
dummyMap.set("DEFAULT1000", {
  title: "Default course 1",
  type: "Core",
  termsOffered: ["t1", "t2"],
  plannedFor: '2023t1',
});
dummyMap.set("DEFAULT2000", {
  title: "Default course 2",
  type: "Elective",
  termsOffered: ["t1", "t2"],
  plannedFor: '2022t2',
});
dummyMap.set("DEFAULT3000", {
  title: "Default course 3",
  type: "General Education",
  termsOffered: ["t2", "t3"],
  plannedFor: '2021t3',
});
dummyMap.set("DEFAULT4000", {
  title: "Default course 1",
  type: "Core",
  termsOffered: ["t1", "t2"],
  plannedFor: null,
});


const initialState = {
  unplanned: ["DEFAULT1000", "DEFAULT2000", "DEFAULT3000"],
  startYear: 2021,
  numYears: 3,
  years: {
    2021: { t0: [], t1: [], t2: [], t3: ['DEFAULT3000', 'something else'] },
    2022: { t0: [], t1: ['test'], t2: ['DEFAULT2000', 'test'], t3: [] },
    2023: { t0: ['DEFAULT1000', 'test'], t1: [], t2: [], t3: [] },
  },
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
      let newUnplanned = state.unplanned.filter(course => course != action.payload);
      console.log(newUnplanned);
      return { ...state, unplanned: newUnplanned };

            // Append course code onto unplanned
            state.unplanned.join(courseCode)
            console.log(state)
            return state;
    case 'REMOVE_ALL_UNPLANNED':
        return { ...state, unplanned: action.payload };
    case 'REMOVE_COURSE':
      console.log('removing the course');
      // Remove courses from years and courses
      const plannedTerm = state.courses.get(action.payload).plannedFor;
      let newCourses = new Map(state.courses);
      newCourses.delete(action.payload);
      Object.assign(state.courses, newCourses);
      if (plannedTerm) {
        // Example plannedTerm: '2021t2'
        const year = plannedTerm.slice(0, 4);
        const term = plannedTerm.slice(4);
        let newTerm = state.years[year][term].filter(course => course != action.payload);
        return {
          ...state,
          years: {
            ...state.years,
            year: {
              ...state.years.year,
              term: newTerm,
            }
          },
          courses: newCourses,
        }
      } else {
        return {
          ...state,
          unplanned: state.unplanned.filter(course => course != action.payload),
          courses: newCourses,
        }
      }
    default: 
          return state; 
    };
 
}

export default plannerReducer;
