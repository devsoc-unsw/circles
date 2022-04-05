import {
  setInLocalStorage,
  extractFromLocalStorage,
  generateEmptyYears,
} from "./plannerHelper";

const dummyMap = new Map();
const plannedCourses = new Map();
const startYear = parseInt(new Date().getFullYear());
const numYears = 3;
// set up hidden object
const hidden = {};
for (let i = 0; i < numYears; i++) {
  hidden[parseInt(startYear) + parseInt(i)] = false;
}
let initialState = {
  unplanned: [],
  startYear: startYear,
  numYears: numYears,
  isSummerEnabled: false,
  years: [
    { T0: [], T1: [], T2: [], T3: [] },
    { T0: [], T1: [], T2: [], T3: [] },
    { T0: [], T1: [], T2: [], T3: [] },
  ],
  courses: dummyMap,
  plannedCourses: plannedCourses,
  completedTerms: new Map(),
  hidden: hidden,
  areYearsHidden: false,
};

let stateCopy;
let newCourses;

const planner = JSON.parse(localStorage.getItem("planner"));
if (planner) initialState = extractFromLocalStorage(planner);

const plannerReducer = (state = initialState, action) => {
  let hidden, areYearsHidden;

  const unscheduleCourse = (code) => {
    let updatedUnplanned = state.unplanned;
    updatedUnplanned.push(code);
    const termTag = state.courses.get(code).plannedFor;

    const yearI = parseInt(termTag.slice(0, 4)) - state.startYear;
    const termI = termTag.slice(4);

    const nTerm = state.years[yearI][termI].filter((course) => course !== code);
    const nYear = state.years[yearI];
    nYear[termI] = nTerm;
    const nYears = state.years;
    nYears[yearI] = nYear;

    const nCourses = state.courses;
    nCourses.get(code).plannedFor = null;
    nCourses.get(code).warning = false;

    stateCopy = {
      ...state,
      unplanned: updatedUnplanned,
    };
    setInLocalStorage(stateCopy);
    return stateCopy;
  };

  switch (action.type) {
    case "ADD_TO_UNPLANNED":
      const { courseCode, courseData } = action.payload;
      // Add course data to courses
      newCourses = new Map(state.courses);
      if (!state.courses[courseCode]) {
        newCourses.set(courseCode, courseData);
      }
      // Append course code onto unplanned
      state.unplanned.push(courseCode);
      stateCopy = { ...state, courses: newCourses };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "ADD_TO_PLANNED":
      const { code, data, position } = action.payload;
      const [yearNum, termNum] = position;
      if (!state.courses[code]) {
        state.courses.set(code, data);
      }

      state.years[yearNum][termNum].push(code);
      // Add course data to courses
      setInLocalStorage(state);
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
      console.log(coursesCpy);
      for (const course in action.payload) {
        // coursesCpy.set(course, !data.courses_state[course].unlocked);
        coursesCpy.get(course).isUnlocked = action.payload[course].unlocked;
        coursesCpy.get(course).warnings = action.payload[course].warnings;
        coursesCpy.get(course).handbook_note = action.payload[course].handbook_note;
      }
      return { ...state, courses: coursesCpy };

    case "SET_UNPLANNED":
      let newUnplanned = state.unplanned.filter(
        (course) => course !== action.payload
      );
      // console.log(newUnplanned);
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
      newCourses = new Map(state.courses);
      // console.log(newCourses.get(action.payload));
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
        const newYear = state.years[yearIndex];
        newYear[term] = newTerm;
        const newYears = state.years;
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
      return unscheduleCourse(action.payload);
    
    case "UNSCHEDULE_ALL":
      state.courses.forEach( (desc, code) => {
        if (desc.plannedFor !== null) {
          stateCopy = unscheduleCourse(code);
        }
      });
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

      hidden = new Map();
      for (let i = 0; i < state.numYears; i++) {
        // hidden[parseInt(newStartYear) + parseInt(i)] = false;
        hidden.set(parseInt(newStartYear) + parseInt(i), false);
      }

      stateCopy = {
        ...state,
        startYear: newStartYear,
        years: updatedYears,
        unplanned: updatedUnplan,
        hidden: hidden,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "SET_DEGREE_LENGTH":
      const newNumYears = action.payload;
      let dupYears = state.years;
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

      hidden = new Map();
      for (let i = 0; i < newNumYears; i++) {
        // hidden[parseInt(state.startYear) + parseInt(i)] = false;
        hidden.set(parseInt(state.startYear) + parseInt(i), false);
      }

      stateCopy = {
        ...state,
        years: dupYears,
        numYears: newNumYears,
        unplanned: newUnplan,
        hidden: hidden,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "HIDE_YEAR":
      hidden = Object.assign({}, state.hidden);
      hidden[action.payload] = true;
      areYearsHidden = true;

      stateCopy = {
        ...state,
        hidden: hidden,
        areYearsHidden: areYearsHidden,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "UNHIDE_ALL_YEARS":
      hidden = Object.assign({}, state.hidden);

      for (const key in hidden) {
        hidden[key] = false;
      }

      stateCopy = {
        ...state,
        hidden: hidden,
        areYearsHidden: false,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "RESET_PLANNER":
      hidden = {};
      for (let i = 0; i < numYears; i++) {
        hidden[parseInt(startYear) + parseInt(i)] = false;
      }
      const init = {
        unplanned: [],
        startYear: parseInt(new Date().getFullYear()),
        numYears: 3,
        isSummerEnabled: false,
        years: [
          { T0: [], T1: [], T2: [], T3: [] },
          { T0: [], T1: [], T2: [], T3: [] },
          { T0: [], T1: [], T2: [], T3: [] },
        ],
        courses: new Map(),
        plannedCourses: new Map(),
        completedTerms: new Map(),
        hidden: hidden,
        areYearsHidden: false,
      };
      setInLocalStorage(init);
      return init;

    case "LOAD_PLANNER":
      const prevSessionState = action.payload;
      return prevSessionState;
    default:
      return state;
  }
};

export default plannerReducer;

// dummyMap.set("COMP2521", {
//   title: "Data Structures and Algorithms",
//   type: "Core",
//   termsOffered: ["T0", "T1", "T2", "T3"],
//   prereqs: "COMP1511 && (COMP1521 || DEFAULT3000)",
//   plannedFor: null,
//   warning: false,
// });
