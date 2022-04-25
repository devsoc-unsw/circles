/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import {
  setInLocalStorage,
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
  courses: {},
  plannedCourses: {},
  completedTerms: {},
  hidden: generateHiddenInit(fakeStartYear, fakeNumYears),
  areYearsHidden: false,
};

const planner = JSON.parse(localStorage.getItem("planner"));
if (planner) initialState = planner;

const unscheduleCourse = (state, code) => {
  state.unplanned.push(code);

  const { plannedFor } = state.courses[code];

  const yearI = parseInt(plannedFor.slice(0, 4), 10) - state.startYear;
  const termI = plannedFor.slice(4);

  state.years[yearI][termI] = state.years[yearI][termI].filter((course) => course !== code);

  state.courses[code].plannedFor = null;
  state.courses[code].isUnlocked = true;
  state.courses[code].warnings = [];
  state.courses[code].handbookNote = "";
  state.courses[code].isAccurate = true;

  setInLocalStorage(state);
};

const plannerSlice = createSlice({
  name: "planner",
  initialState,
  reducers: {
    addToUnplanned: (state, action) => {
      const { courseCode, courseData } = action.payload;
      if (!state.courses[courseCode]) {
        state.courses[courseCode] = courseData;
      }
      setInLocalStorage(state);
    },
    addToPlanned: (state, action) => {
      const { code, position } = action.payload;
      const [yearNum, termNum] = position;

      state.years[yearNum][termNum].push(code);
      // Add course data to courses
      setInLocalStorage(state);
    },
    // addCoreCourses: (state, action) => {
    //   state.courses = {
    //     ...state.courses,
    //     ...action.payload,
    //   };
    //   setInLocalStorage(state);
    // },
    // setNumYears: (state, action) => {
    //   state.numYears = action.payload;
    //   setInLocalStorage(state);
    // },
    setYears: (state, action) => {
      state.years = action.payload;
      setInLocalStorage(state);
    },
    toggleWarnings: (state, action) => {
      Object.keys(action.payload).forEach((course) => {
        if (state.courses[course]) {
          const {
            is_accurate: isAccurate, unlocked, warnings, handbook_note: handbookNote,
          } = action.payload[course];

          state.courses[course].isAccurate = isAccurate;
          state.courses[course].isUnlocked = unlocked;
          state.courses[course].warnings = warnings;
          state.courses[course].handbookNote = handbookNote;
        }
      });
    },
    setUnplanned: (state, action) => {
      state.unplanned = state.unplanned.filter(
        (course) => course !== action.payload,
      );
      setInLocalStorage(state);
    },
    // removeAllUnplanned: (state, action) => {
    //   state.unplanned = action.plannedCourses;
    //   setInLocalStorage(state);
    // },
    removeCourse: (state, action) => {
      // Remove courses from years and courses
      if (state.courses[action.payload]) {
        const { plannedFor } = state.courses[action.payload];

        // remove course
        delete state.courses[action.payload];

        if (plannedFor) {
          // course must already been planned
          // Example plannedFor: '2021t2'
          const yearIndex = parseInt(plannedFor.slice(0, 4), 10) - state.startYear;
          const term = plannedFor.slice(4);
          // remove the course from the year and term
          state.years[yearIndex][term] = state.years[yearIndex][term].filter(
            (course) => course !== action.payload,
          );
        } else {
          // course must be in unplanned
          state.unplanned = state.unplanned.filter(
            (course) => course !== action.payload,
          );
        }
        setInLocalStorage(state);
      }
    },
    removeAllCourses: (state) => {
      state.years = generateEmptyYears(state.numYears);
      state.courses = {};
      state.unplanned = [];
      setInLocalStorage(state);
    },
    moveCourse: (state, action) => {
      const { course, term } = action.payload;
      if (state.courses[course]) {
        state.courses[course].plannedFor = term;
      }
      setInLocalStorage(state);
    },
    unschedule: (state, action) => {
      unscheduleCourse(action.payload);
      // Object.assign(state, unscheduleCourse(action.payload));
    },
    unscheduleAll: (state) => {
      // TODO: FIX
      state.courses.forEach((desc, c) => {
        if (desc.plannedFor !== null) {
          unscheduleCourse(c);
          // Object.assign(state, unscheduleCourse(c));
        }
      });
    },
    toggleSummer: (state) => {
      state.isSummerEnabled = !state.isSummerEnabled;
      setInLocalStorage(state);
    },
    toggleTermComplete: (state, action) => {
      const isCompleted = state.completedTerms[action.payload];
      state.completedTerms[action.payload] = !isCompleted;
      setInLocalStorage(state);
    },
    updateStartYear: (state, action) => {
      const currEndYear = state.startYear + state.numYears - 1;
      const newStartYear = Number(action.payload);
      const updatedYears = [];

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
              state.unplanned.push(c);
              state.courses.get(c).plannedFor = null;
              state.courses.get(c).isUnlocked = true;
            });
          });
        }
      }

      state.startYear = newStartYear;
      state.years = updatedYears;
      setInLocalStorage(state);
    },
    setDegreeLength: (state, action) => {
      const newNumYears = action.payload;

      if (newNumYears !== state.numYears) {
        if (newNumYears > state.numYears) {
          // add new empty years
          for (let i = 0; i < newNumYears - state.numYears; i++) {
            state.years.push({
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
            state.years.splice(i - 1, 1);
          }
        }

        state.numYears = newNumYears;
        state.hidden = generateHiddenInit(state.startYear, newNumYears);

        setInLocalStorage(state);
      }
    },
    hideYear: (state, action) => {
      state.hidden[action.payload] = true;
      state.areYearsHidden = true;
      setInLocalStorage(state);
    },
    unhideAllYears: (state) => {
      Object.keys(state.hidden).forEach((year) => {
        state.hidden[year] = false;
      });
      state.areYearsHidden = false;
      setInLocalStorage(state);
    },
    resetPlanner: (state) => {
      setInLocalStorage(initialState);
      Object.assign(state, initialState);
    },
  },
});

export const {
  addToPlanned, addToUnplanned, addCoreCourses, setNumYears, setYears,
  toggleWarnings, setUnplanned, removeAllUnplanned, removeCourse, removeAllCourses,
  moveCourse, unschedule, unscheduleAll, toggleSummer, toggleTermComplete,
  updateStartYear, setDegreeLength, hideYear, unhideAllYears, resetPlanner,
} = plannerSlice.actions;

export default plannerSlice.reducer;
