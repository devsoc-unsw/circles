/* eslint-disable no-param-reassign */
import {
  setInLocalStorage,
  extractFromLocalStorage,
  generateEmptyYears,
} from "./plannerHelper";

// set up hidden object
const generateHiddenInit = (startYear, numYears) => {
  const hiddenInit = {};
  for (let i = -1; i < numYears - 1; i++) {
    hiddenInit[startYear + i] = false;
  }
  return hiddenInit;
};

const fakeStartYear = parseInt(new Date().getFullYear(), 10);
const fakeNumYears = 3;
let initialState = {
  unplanned: [],
  startYear: fakeStartYear,
  numYears: fakeNumYears,
  isSummerEnabled: false,
  years: [
    {
      T0: [], T1: [], T2: [], T3: [],
    },
    {
      T0: [], T1: [], T2: [], T3: [],
    },
    {
      T0: [], T1: [], T2: [], T3: [],
    },
  ],
  courses: new Map(),
  plannedCourses: new Map(),
  completedTerms: new Map(),
  hidden: generateHiddenInit(fakeStartYear, fakeNumYears),
  areYearsHidden: false,
};

let stateCopy;
let newCourses;

const planner = JSON.parse(localStorage.getItem("planner"));
if (planner) initialState = extractFromLocalStorage(planner);

const plannerReducer = (state = initialState, action) => {
  const unscheduleCourse = (code) => {
    const updatedUnplanned = state.unplanned;
    updatedUnplanned.push(code);
    const termTag = state.courses.get(code).plannedFor;

    const yearI = parseInt(termTag.slice(0, 4), 10) - state.startYear;
    const termI = termTag.slice(4);

    const nTerm = state.years[yearI][termI].filter((course) => course !== code);
    const nYear = state.years[yearI];
    nYear[termI] = nTerm;
    const nYears = state.years;
    nYears[yearI] = nYear;

    const nCourses = state.courses;
    nCourses.get(code).plannedFor = null;
    nCourses.get(code).isUnlocked = true;
    nCourses.get(code).warnings = [];
    nCourses.get(code).handbookNote = "";
    nCourses.get(code).isAccurate = true;

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
      newCourses = new Map(state.courses);
      if (!state.courses[courseCode]) {
        newCourses.set(courseCode, courseData);
      }
      state.unplanned.push(courseCode);
      stateCopy = { ...state, courses: newCourses };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "ADD_TO_PLANNED":
      const { code, position } = action.payload;
      stateCopy = { ...state };
      const [yearNum, termNum] = position;

      stateCopy.years[yearNum][termNum].push(code);
      // Add course data to courses
      setInLocalStorage(stateCopy);
      return stateCopy;

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
      const coursesCpy = new Map(state.courses);
      Object.keys(action.payload).forEach((course) => {
        coursesCpy.get(course).isAccurate = action.payload[course].is_accurate;
        coursesCpy.get(course).isUnlocked = action.payload[course].unlocked;
        coursesCpy.get(course).warnings = action.payload[course].warnings;
        coursesCpy.get(course).handbookNote = action.payload[course].handbook_note;
      });
      return { ...state, courses: coursesCpy };

    case "SET_UNPLANNED":
      const newUnplanned = state.unplanned.filter(
        (course) => course !== action.payload,
      );
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
      newCourses.get(action.payload).plannedFor = null;
      newCourses.delete(action.payload);
      Object.assign(state.courses, newCourses);
      if (plannedTerm) {
        // Example plannedTerm: '2021t2'
        const yearIndex = parseInt(plannedTerm.slice(0, 4), 10) - state.startYear;
        const term = plannedTerm.slice(4);
        const newTerm = state.years[yearIndex][term].filter(
          (course) => course !== action.payload,
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
      }
      stateCopy = {
        ...state,
        unplanned: state.unplanned.filter(
          (course) => course !== action.payload,
        ),
        courses: newCourses,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

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
      const { course, term } = action.payload;
      const courseInfo = state.courses.get(course);
      courseInfo.plannedFor = term;
      const updatedCourses = new Map(state.courses).set(course, courseInfo);
      stateCopy = { ...state, courses: updatedCourses };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "UNSCHEDULE":
      return unscheduleCourse(action.payload);

    case "UNSCHEDULE_ALL":
      state.courses.forEach((desc, c) => {
        if (desc.plannedFor !== null) {
          stateCopy = unscheduleCourse(c);
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
      const updatedYears = [];
      const updatedUnplan = [...state.unplanned];

      for (let i = 0; i < state.numYears; i++) {
        const yearVisiting = i + newStartYear;
        if (yearVisiting <= currEndYear && yearVisiting >= state.startYear) {
          // add existing year
          updatedYears.push(state.years[yearVisiting - state.startYear]);
        } else {
          // add empty year
          updatedYears.push({
            T0: [], T1: [], T2: [], T3: [],
          });
          // unschedule the courses that are in the year which will be removed
          const yearToBeRemoved = state.years[state.numYears - i - 1];
          Object.values(yearToBeRemoved).forEach((t) => {
            Object.values(t).forEach((c) => {
              updatedUnplan.push(c);
              state.courses.get(c).plannedFor = null;
              state.courses.get(c).isUnlocked = true;
            });
          });
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
      const dupYears = [...state.years];

      if (newNumYears === state.numYears) return state;

      if (newNumYears > state.numYears) {
        // add new empty years
        for (let i = 0; i < newNumYears - state.numYears; i++) {
          dupYears.push({
            T0: [], T1: [], T2: [], T3: [],
          });
        }
      } else {
        // remove extra years
        for (let i = state.numYears; i >= newNumYears; i--) {
          Object.values(state.years[i - 1])
            .forEach((t) => {
              t.forEach((c) => {
                state.courses.get(c).plannedFor = null;
              });
            });
          // remove year
          dupYears.splice(i - 1, 1);
        }
      }

      stateCopy = {
        ...state,
        years: dupYears,
        numYears: newNumYears,
        hidden: generateHiddenInit(state.startYear, newNumYears),
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "HIDE_YEAR":
      const hiddenCopy = { ...state.hidden };
      hiddenCopy[action.payload] = true;

      stateCopy = {
        ...state,
        hidden: hiddenCopy,
        areYearsHidden: true,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "UNHIDE_ALL_YEARS":
      const hiddenCp = { ...state.hidden };
      Object.keys(hiddenCp).forEach((year) => {
        hiddenCp[year] = false;
      });

      stateCopy = {
        ...state,
        hidden: hiddenCp,
        areYearsHidden: false,
      };
      setInLocalStorage(stateCopy);
      return stateCopy;

    case "RESET_PLANNER":
      setInLocalStorage(initialState);
      return initialState;

    case "LOAD_PLANNER":
      const prevSessionState = action.payload;
      return prevSessionState;
    default:
      return state;
  }
};

export default plannerReducer;
