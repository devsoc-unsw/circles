const dummyMap = new Map();

const plannedCourses = new Map();
dummyMap.set("COMP2521", {
  title: "Data Structures and Algorithms",
  type: "Core",
  termsOffered: ["T0", "T1", "T2", "T3"],
  prereqs: "COMP1511 && (COMP1521 || DEFAULT3000)",
  plannedFor: null,
  warning: false,
});
dummyMap.set("COMP1521", {
  title: "Computer Systems Fundamentals",
  type: "Core",
  termsOffered: ["T0", "T1", "T2"],
  prereqs: "COMP1511",
  plannedFor: null,
  warning: false,
});
dummyMap.set("COMP1511", {
  title: "Programming Fundamentals",
  type: "Core",
  termsOffered: ["T0", "T1", "T2", "T3"],
  prereqs: "",
  plannedFor: null,
  warning: false,
});
dummyMap.set("COMP6080", {
  title: "Web Front-End Programming",
  type: "Elective",
  termsOffered: ["T1", "T3"],
  prereqs: "COMP1531 && (COMP2521 || COMP1927)",
  plannedFor: null,
  warning: false,
});
dummyMap.set("ARTS1240", {
  title: "Environment and Society",
  type: "General Education",
  termsOffered: ["T0", "T1", "T2"],
  prereqs: "",
  plannedFor: null,
  warning: false,
});

const generateEmptyYears = (nYears) => {
  let res = [];
  for (let i = 0; i < nYears; ++i) {
    const year = { T0: [], T1: [], T2: [], T3: [] };
    res.push(year);
  }
  return res;
};

let initialState = {
  unplanned: ["COMP1511", "COMP1521", "COMP2521", "ARTS1240", "COMP6080"],
  startYear: parseInt(new Date().getFullYear()),
  numYears: 3,
  isSummerEnabled: false,
  years: [
    { T0: [], T1: [], T2: [], T3: [] },
    { T0: [], T1: [], T2: [], T3: [] },
    { T0: [], T1: [], T2: [], T3: [] },
  ],
  courses: dummyMap,
  plannedCourses: plannedCourses,
  completedTerms: new Map(),
};

let stateCopy = "";

const setInLocalStorage = (state) => {
  let stateCopy = Object.assign({}, state);
  const jsonCourses = Array.from(state.courses.entries());
  const jsonPlannedCourses = Array.from(state.plannedCourses.entries());
  const jsonCompletedTerms = Array.from(state.completedTerms.entries());
  stateCopy["courses"] = jsonCourses;
  stateCopy["plannedCourses"] = jsonPlannedCourses;
  stateCopy["completedTerms"] = jsonCompletedTerms;
  localStorage.setItem("planner", JSON.stringify(stateCopy));
};

const extractFromLocalStorage = (planner) => {
  let plannerCpy = Object.assign({}, planner);
  const coursesCpy = new Map(planner.courses);
  const plannedCoursesCpy = new Map(planner.plannedCourses);
  const completedTermsCpy = new Map(planner.completedTerms);
  plannerCpy.courses = coursesCpy;
  plannerCpy.plannerCourses = plannedCoursesCpy;
  plannerCpy.completedTerms = completedTermsCpy;
  return plannerCpy;
};

const planner = JSON.parse(localStorage.getItem("planner"));
if (planner) initialState = extractFromLocalStorage(planner);

const plannerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_TO_UNPLANNED":
      const { courseCode, courseData } = action.payload;

      // Add course data to courses
      if (!state.courses[courseCode]) {
        state.courses.set(courseCode, courseData);
      }

      // Append course code onto unplanned

      state.unplanned.push(courseCode);
      return state;

    case "ADD_CORE_COURSES":
      stateCopy = {
        ...state,
        courses: new Map([...state.courses, ...action.payload]),
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "SET_NUM_YEARS":
      stateCopy = { ...state, numYears: action.payload };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "SET_YEARS":
      stateCopy = { ...state, years: action.payload };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "TOGGLE_WARNINGS":
      let coursesCpy = new Map(state.courses);
      for (const course in action.payload) {
        // coursesCpy.set(course, !data.courses_state[course].unlocked);
        coursesCpy.get(course).warning = !action.payload[course].unlocked;
      }
      return { ...state, courses: coursesCpy };

    case "SET_UNPLANNED":
      let newUnplanned = state.unplanned.filter(
        (course) => course !== action.payload
      );
      console.log(newUnplanned);
      stateCopy = { ...state, unplanned: newUnplanned };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "REMOVE_ALL_UNPLANNED":
      stateCopy = { ...state, unplanned: action.payload };
      setInLocalStorage(stateCopy);
      return stateCopy;

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
        stateCopy = {
          ...state,
          years: newYears,
          courses: newCourses,
        };
        setInLocalStorage(stateCopy);
        return stateCopy;
      } else {
        stateCopy = {
          ...state,
          unplanned: state.unplanned.filter(
            (course) => course !== action.payload
          ),
          courses: newCourses,
        };
        setInLocalStorage(stateCopy);
        return stateCopy;
      }
    case "REMOVE_ALL_COURSES":
      const newYears = generateEmptyYears(state.numYears);
      const emptyMap = new Map();

      stateCopy = {
        ...state,
        years: newYears,
        courses: emptyMap,
        unplanned: [],
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "MOVE_COURSE":
      const { course, term, warning } = action.payload;
      const courseInfo = state.courses.get(course);
      courseInfo["plannedFor"] = term;
      // courseInfo["warning"] = warning;
      let updatedCourses = new Map(state.courses).set(course, courseInfo);
      stateCopy = { ...state, courses: updatedCourses };
      setInLocalStorage(stateCopy);
      return stateCopy;

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

      stateCopy = {
        ...state,
        unplanned: updatedUnplanned,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "TOGGLE_SUMMER":
      stateCopy = { ...state, isSummerEnabled: !state.isSummerEnabled };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "TOGGLE_TERM_COMPLETE":
      const clonedCompletedTerms = new Map(state.completedTerms);
      let isCompleted = clonedCompletedTerms.get(action.payload);
      // if it doesnt exist in map, then the term is not completed
      if (isCompleted == null) isCompleted = false;
      clonedCompletedTerms.set(action.payload, !isCompleted);

      stateCopy = { ...state, completedTerms: clonedCompletedTerms };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "UPDATE_START_YEAR":
      const currEndYear = state.startYear + state.numYears - 1;
      const newStartYear = Number(action.payload);
      let updatedYears = [];
      let updatedUnplan = [...state.unplanned];

      for (let i = 0; i < state.numYears; i++) {
        const yearVisiting = i + newStartYear;
        if (yearVisiting <= currEndYear && yearVisiting >= state.startYear) {
          // add existing year
          updatedYears.push(state.years[yearVisiting - state.startYear]);
        } else {
          // add empty year
          updatedYears.push({ T0: [], T1: [], T2: [], T3: [] });
          // unschedule the courses that are in the year which will be removed
          const yearToBeRemoved = state.years[state.numYears - i - 1];
          for (let term in yearToBeRemoved) {
            yearToBeRemoved[term].forEach((course) => {
              updatedUnplan.push(course);
              state.courses.get(course).plannedFor = null;
              state.courses.get(course).warning = false;
            });
          }
        }
      }
      stateCopy = {
        ...state,
        startYear: newStartYear,
        years: updatedYears,
        unplanned: updatedUnplan,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "SET_DEGREE_LENGTH":
      const newNumYears = action.payload;
      let dupYears = new Object(state.years);
      let newUnplan = [...state.unplanned];
      if (newNumYears === state.numYears) return state;
      else if (newNumYears > state.numYears) {
        // add empty years to the end
        const diff = newNumYears - state.numYears;
        for (let i = 0; i < diff; i++) {
          dupYears.push({ T0: [], T1: [], T2: [], T3: [] });
        }
      } else {
        // remove extra years
        for (let i = state.numYears; i >= 1; i--) {
          if (i > newNumYears) {
            // unschedule  courses in year
            const yearToBeRemoved = state.years[i - 1];
            for (let term in yearToBeRemoved) {
              yearToBeRemoved[term].forEach((course) => {
                newUnplan.push(course);
                state.courses.get(course).plannedFor = null;
                state.courses.get(course).warning = false;
              });
            }
            // remove year
            dupYears.splice(i - 1, 1);
          }
        }
      }
      stateCopy = {
        ...state,
        years: dupYears,
        numYears: newNumYears,
        unplanned: newUnplan,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;
    case "LOAD_PLANNER":
      const prevSessionState = action.payload;
      return prevSessionState;
    default:
      return state;
  }
};

export default plannerReducer;
