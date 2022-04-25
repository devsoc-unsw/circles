/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
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

const unscheduleCourse = (state, code) => {
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

const plannerSlice = createSlice({
  name: "planner",
  initialState,
  reducers: {
    addToUnplanned: (state, action) => {
      const { courseCode, courseData } = action.payload;
      newCourses = new Map(state.courses);
      if (!state.courses[courseCode]) {
        newCourses.set(courseCode, courseData);
      }
      state.unplanned.push(courseCode);
      state.courses = newCourses;
      setInLocalStorage(state);
    },
    addToPlanned: (state, action) => {
      const { code, position } = action.payload;
      state = { ...state };
      const [yearNum, termNum] = position;

      state.years[yearNum][termNum].push(code);
      // Add course data to courses
      setInLocalStorage(state);
    },
    addCoreCourses: (state, action) => {
      state.courses = new Map([...state.courses, ...action.payload]);
      setInLocalStorage(state);
    },
    setNumYears: (state, action) => {
      state.numYears = action.payload;
      setInLocalStorage(state);
    },

    setYears: (state, action) => {
      state.years = action.payload;
      setInLocalStorage(state);
    },
    toggleWarnings: (state, action) => {
      Object.keys(action.payload).forEach((course) => {
        state.courses.get(course).isAccurate = action.payload[course].is_accurate;
        state.courses.get(course).isUnlocked = action.payload[course].unlocked;
        state.courses.get(course).warnings = action.payload[course].warnings;
        state.courses.get(course).handbookNote = action.payload[course].handbook_note;
      });
    },
    setUnplanned: (state, action) => {
      state.unplanned = state.unplanned.filter(
        (course) => course !== action.payload,
      );
      setInLocalStorage(state);
    },
    removeAllUnplanned: (state, action) => {
      state.unplanned = action.plannedCourses;
      setInLocalStorage(state);
    },
    removeCourse: (state, action) => {
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
        state.years = newYears;
        state.courses = newCourses;
        setInLocalStorage(state);
      } else {
        state.unplanned = state.unplanned.filter(
          (course) => course !== action.payload,
        );
        state.courses = newCourses;
        setInLocalStorage(state);
      }
    },
    removeAllCourses: (state) => {
      state.years = generateEmptyYears(state.numYears);
      state.courses = new Map();
      state.unplanned = [];
      setInLocalStorage(state);
    },
    moveCourse: (state, action) => {
      const { course, term } = action.payload;
      const courseInfo = state.courses.get(course);
      courseInfo.plannedFor = term;
      state.courses = new Map(state.courses).set(course, courseInfo);
      setInLocalStorage(state);
    },
    unschedule: (state, action) => {
      Object.assign(state, unscheduleCourse(action.payload));
    },
    unscheduleAll: (state) => {
      state.courses.forEach((desc, c) => {
        if (desc.plannedFor !== null) {
          Object.assign(state, unscheduleCourse(c));
        }
      });
    },
    toggleSummer: (state) => {
      state.isSummerEnabled = !state.isSummerEnabled;
      setInLocalStorage(state);
    },
    toggleTermComplete: (state, action) => {
      const clonedCompletedTerms = new Map(state.completedTerms);
      let isCompleted = clonedCompletedTerms.get(action.payload);
      // if it doesnt exist in map, then the term is not completed
      if (isCompleted == null) isCompleted = false;
      clonedCompletedTerms.set(action.payload, !isCompleted);

      state.completedTerms = clonedCompletedTerms;
      setInLocalStorage(state);
    },
    updateStartYear: (state, action) => {
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

      state.startYear = newStartYear;
      state.years = updatedYears;
      state.unplanned = updatedUnplan;
      setInLocalStorage(state);
    },
    setDegreeLength: (state, action) => {
      const newNumYears = action.payload;
      const dupYears = [...state.years];

      if (newNumYears !== state.numYears) {
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

        state.years = dupYears;
        state.numYears = newNumYears;
        state.hidden = generateHiddenInit(state.startYear, newNumYears);

        setInLocalStorage(state);
      }
    },
    hideYear: (state, action) => {
      const hiddenCopy = { ...state.hidden };
      hiddenCopy[action.payload] = true;

      state.hidden = hiddenCopy;
      state.areYearsHidden = true;

      setInLocalStorage(state);
    },
    unhideAllYears: (state) => {
      const hiddenCp = { ...state.hidden };
      Object.keys(hiddenCp).forEach((year) => {
        hiddenCp[year] = false;
      });

      state.hidden = hiddenCp;
      state.areYearsHidden = false;
      setInLocalStorage(state);
    },
    resetPlanner: (state) => {
      setInLocalStorage(initialState);
      Object.assign(state, initialState);
    },
    loadPlanner: (state, action) => {
      Object.assign(state, action.prevSessionState);
    },
  },
});

export const {
  addToPlanned, addToUnplanned, addCoreCourses, setNumYears, setYears,
  toggleWarnings, setUnplanned, removeAllUnplanned, removeCourse, removeAllCourses,
  moveCourse, unschedule, unscheduleAll, toggleSummer, toggleTermComplete,
  updateStartYear, setDegreeLength, hideYear, unhideAllYears, resetPlanner, loadPlanner,
} = plannerSlice.actions;

export default plannerSlice.reducer;
