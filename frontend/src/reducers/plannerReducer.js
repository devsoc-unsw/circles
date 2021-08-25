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

const generateEmptyYears = (nYears) => {
  let res = [];
  for (let i = 0; i < nYears; ++i) {
    const year = { t1: [], t2: [], t3: [] };
    res.push(year);
  }
  return res;
}

const initialState = {
  unplanned: ["DEFAULT4000"],
  startYear: 2021,
  numYears: 3,
  years: [
    { t1: [], t2: [], t3: ['DEFAULT3000'] },
    { t1: [], t2: ['DEFAULT2000'], t3: [] },
    { t1: ['DEFAULT1000'], t2: [], t3: [] },
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
    case "ADD_CORE_COURSES": 
      console.log(new Map([...state.courses, ...action.payload]));
      return {
        ...state,
        courses: new Map([...state.courses, ...action.payload])
      }
    case "SET_YEARS":
      return { ...state, years: action.payload };

    case "SET_UNPLANNED":
      let newUnplanned = state.unplanned.filter(course => course !== action.payload);
      console.log(newUnplanned);
      return { ...state, unplanned: newUnplanned };
    case 'REMOVE_ALL_UNPLANNED':
        return { ...state, unplanned: action.payload };
    
        case 'REMOVE_COURSE':
      // Remove courses from years and courses
      const plannedTerm = state.courses.get(action.payload).plannedFor;
      let newCourses = new Map(state.courses);
      newCourses.delete(action.payload);
      Object.assign(state.courses, newCourses);
      if (plannedTerm) {
        // Example plannedTerm: '2021t2'
        const yearIndex = parseInt(plannedTerm.slice(0, 4)) - state.startYear ;
        const term = plannedTerm.slice(4);
        const newTerm = state.years[yearIndex][term].filter(course => course !== action.payload);  
        const newYear = new Object(state.years[yearIndex]);
        newYear[term] = newTerm; 
        const newYears = new Object(state.years);
        newYears[yearIndex] = newYear;
        return {
          ...state,
          years: newYears,
          courses: newCourses,
        }
      } else {
        return {
          ...state,
          unplanned: state.unplanned.filter(course => course !== action.payload),
          courses: newCourses,
        }
      }
    case 'REMOVE_ALL_COURSES':
      const newYears = generateEmptyYears(state.numYears);
      const emptyMap = new Map();
      return {
        ...state, 
        years: newYears,
        courses: emptyMap, 
        unplanned: []
      }
      default: 
          return state; 
  }
}

export default plannerReducer;
