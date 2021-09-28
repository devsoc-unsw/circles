const dummyMap = new Map();

const plannedCourses = new Map();
dummyMap.set("COMP2521", {
  title: "Data Structures and Algorithms",
  type: "Core",
  termsOffered: ["t0", "t1", "t2", "t3"],
  prereqs: "COMP1511 && (COMP1521 || DEFAULT3000)",
  plannedFor: null,
  warning: false,
});
dummyMap.set("COMP1521", {
  title: "Computer Systems Fundamentals",
  type: "Elective",
  termsOffered: ["t0", "t1", "t2"],
  prereqs: "COMP1511",
  plannedFor: "2022t2",
  warning: false,
});
dummyMap.set("COMP1511", {
  title: "Programming Fundamentals",
  type: "Core",
  termsOffered: ["t0", "t1", "t2", "t3"],
  prereqs: "",
  plannedFor: "2021t3",
  warning: false,
});
dummyMap.set("COMP6080", {
  title: "Web Front-End Programming",
  type: "General Education",
  termsOffered: ["t1", "t3"],
  prereqs: "COMP1521 && (COMP2521 || COMP1927)",
  plannedFor: "2022t3",
  warning: false,
});

const generateEmptyYears = (nYears) => {
  let res = [];
  for (let i = 0; i < nYears; ++i) {
    const year = { t0: [], t1: [], t2: [], t3: [] };
    res.push(year);
  }
  return res;
};

const initialState = {
  unplanned: ["COMP2521"],
  startYear: 2021,
  numYears: 3,
  isSummerEnabled: false,
  years: [
    { t0: [], t1: [], t2: [], t3: ["COMP1511"] },
    { t0: [], t1: [], t2: ["COMP1521"], t3: [] },
    { t0: [], t1: [], t2: [], t3: ["COMP6080"] },
  ],
  courses: dummyMap,
  plannedCourses: plannedCourses,
  completedTerms: new Map(),
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
      return {
        ...state,
        courses: new Map([...state.courses, ...action.payload]),
      };
    case "SET_YEARS":
      return { ...state, years: action.payload };

    case "SET_UNPLANNED":
      let newUnplanned = state.unplanned.filter(
        (course) => course !== action.payload
      );
      console.log(newUnplanned);
      return { ...state, unplanned: newUnplanned };
    case "REMOVE_ALL_UNPLANNED":
      return { ...state, unplanned: action.payload };

    case "REMOVE_COURSE":
      // Remove courses from years and courses
      const plannedTerm = state.courses.get(action.payload).plannedFor;
      let newCourses = new Map(state.courses);
      newCourses.get(action.payload).plannedFor = null;
      newCourses.delete(action.payload);
      Object.assign(state.courses, newCourses);
      if (plannedTerm) {
        // Example plannedTerm: '2021t2'
        const yearIndex = parseInt(plannedTerm.slice(0, 4)) - state.startYear;
        const term = plannedTerm.slice(4);
        const newTerm = state.years[yearIndex][term].filter(
          (course) => course !== action.payload
        );
        const newYear = new Object(state.years[yearIndex]);
        newYear[term] = newTerm;
        const newYears = new Object(state.years);
        newYears[yearIndex] = newYear;
        return {
          ...state,
          years: newYears,
          courses: newCourses,
        };
      } else {
        return {
          ...state,
          unplanned: state.unplanned.filter(
            (course) => course !== action.payload
          ),
          courses: newCourses,
        };
      }
    case "REMOVE_ALL_COURSES":
      const newYears = generateEmptyYears(state.numYears);
      const emptyMap = new Map();
      return {
        ...state,
        years: newYears,
        courses: emptyMap,
        unplanned: [],
      };

    // case "UPDATE_PLANNED_COURSES":
    // 	const { course, term, warning } = action.payload;
    // 	console.log(term)
    // 	const plannedClone = new Map(state.plannedCourses).set(course, {
    // 		term: term,
    // 		warning: warning,
    // 	});
    // 	return { ...state, plannedCourses: plannedClone };

    case "MOVE_COURSE":
      const { course, term, warning } = action.payload;
      const courseInfo = state.courses.get(course);
      courseInfo["plannedFor"] = term;
      courseInfo["warning"] = warning;
      let updatedCourses = new Map(state.courses).set(course, courseInfo);

      return { ...state, courses: updatedCourses };
    case "UNSCHEDULE":
      let updatedUnplanned = state.unplanned;
      updatedUnplanned.push(action.payload);
      const termTag = state.courses.get(action.payload).plannedFor;

      const yearI = parseInt(termTag.slice(0, 4)) - state.startYear;
      const termI = termTag.slice(4);

      const nTerm = new Object(
        state.years[yearI][termI].filter((course) => course !== action.payload)
      );
      const nYear = new Object(state.years[yearI]);
      nYear[termI] = nTerm;
      const nYears = new Object(state.years);
      nYears[yearI] = nYear;
      // console.log(nYears);

      const nCourses = new Object(state.courses);
      nCourses.get(action.payload).plannedFor = null;
      nCourses.get(action.payload).warning = false;

      return {
        ...state,
        unplanned: updatedUnplanned,
        // years: nYears,
        // courses: nCourses,
      };
    case "TOGGLE_SUMMER":
      return { ...state, isSummerEnabled: !state.isSummerEnabled };

    case "TOGGLE_TERM_COMPLETE":
      const clonedCompletedTerms = new Map(state.completedTerms);
      let isCompleted = clonedCompletedTerms.get(action.payload);
      // if it doesnt exist in map, then the term is not completed
      if (isCompleted == null) isCompleted = false;
      clonedCompletedTerms.set(action.payload, !isCompleted);
      return { ...state, completedTerms: clonedCompletedTerms };

    case "SET_START_YEAR":
      const currEndYear = state.startYear + state.numYears - 1;
      const newStartYear = Number(action.payload);
      let updatedYears = [];
      let updatedUnplan = [...state.unplanned];

      for (let i = 0; i < state.numYears; i++) {
        const yearVisiting = i + newStartYear;
        if (yearVisiting <= currEndYear && yearVisiting >= state.startYear) {
          updatedYears.push(state.years[yearVisiting - state.startYear]);
        } else {
          updatedYears.push({ t0: [], t1: [], t2: [], t3: [] });
          // unschedule the courses that are in the year which will be removed
          const yearToBeRemoved = state.years[state.numYears - i - 1];
          console.log(yearToBeRemoved);
          for (let term in yearToBeRemoved) {
            yearToBeRemoved[term].forEach((course) => {
              console.log(course);
              updatedUnplan.push(course);
              state.courses.get(course).plannedFor = null;
              state.courses.get(course).warning = false;
            });
          }
        }
      }
      console.log(state.courses);

      return {
        ...state,
        startYear: newStartYear,
        years: updatedYears,
        unplanned: updatedUnplan,
      };
    default:
      return state;
  }
};

export default plannerReducer;
