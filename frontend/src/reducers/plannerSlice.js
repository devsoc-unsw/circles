import { createSlice } from "@reduxjs/toolkit";
import { DATA_STRUCTURE_VERSION } from "../constants";

// set up hidden object
const generateHiddenInit = (startYear, numYears) => {
  const hiddenInit = {};
  for (let i = -1; i < numYears - 1; i++) {
    hiddenInit[startYear + i] = false;
  }
  return hiddenInit;
};

const generateEmptyYears = (nYears) => {
  const res = [];
  for (let i = 0; i < nYears; i++) {
    res.push({
      T0: [], T1: [], T2: [], T3: [],
    });
  }
  return res;
};

/**
 * IMPORTANT NOTE:
 *
 * Since we store the state in local storage, this means that any modifications
 * to the state (i.e. changing the initialState data structure fields, a bug
 * created in the reducer functions that can cause some logic issues, etc.)
 * can have unintended effects for users using a previous version local storage
 * data format. This could cause Circles to break or create some weird behaviours.
 *
 * You must update/increment DATA_STRUCTURE_VERSION value found in `constants.js`
 * to indicate is a breaking change is introduced to make it non compatible with
 * previous versions of local storage data.
 *
 */

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
  version: DATA_STRUCTURE_VERSION,
};

const planner = JSON.parse(localStorage.getItem("planner"));
if (planner && planner.version === initialState.version) {
  initialState = planner;
} else if (planner && planner.version !== initialState.version) {
  localStorage.setItem("isUpdate", true);
}

const plannerSlice = createSlice({
  name: "planner",
  initialState,
  reducers: {
    addToUnplanned: (state, action) => {
      const { courseCode, courseData } = action.payload;
      if (!state.courses[courseCode]) {
        state.courses[courseCode] = courseData;
        state.unplanned.push(courseCode);
      }
      localStorage.setItem("planner", JSON.stringify(state));
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
      localStorage.setItem("planner", JSON.stringify(state));
    },
    setUnplannedCourseToTerm: (state, action) => {
      const {
        destRow, destTerm, destIndex, course,
      } = action.payload;
      state.unplanned = state.unplanned.filter(
        (c) => c !== course,
      );
      state.years[destRow][destTerm].splice(destIndex, 0, course);
      localStorage.setItem("planner", JSON.stringify(state));
    },
    setPlannedCourseToTerm: (state, action) => {
      const {
        srcRow, srcTerm, srcIndex,
        destRow, destTerm, destIndex, course,
      } = action.payload;
      state.years[srcRow][srcTerm].splice(srcIndex, 1);
      state.years[destRow][destTerm].splice(destIndex, 0, course);
      localStorage.setItem("planner", JSON.stringify(state));
    },
    moveCourse: (state, action) => {
      const { course, term } = action.payload;
      if (state.courses[course]) {
        state.courses[course].plannedFor = term;
      }
      localStorage.setItem("planner", JSON.stringify(state));
    },
    // TODO NOTE: think about if you would want to call the backend first to fetch dependant courses
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
        localStorage.setItem("planner", JSON.stringify(state));
      }
    },
    removeCourses: (state, action) => {
      const courses = action.payload;
      courses.forEach((course) => {
        plannerSlice.caseReducers.removeCourse(state, { payload: course });
      });
    },
    removeAllCourses: (state) => {
      state.years = generateEmptyYears(state.numYears);
      state.courses = {};
      state.unplanned = [];
      localStorage.setItem("planner", JSON.stringify(state));
    },
    unschedule: (state, action) => {
      const { destIndex, code } = action.payload;

      if (Number.isNaN(destIndex)) {
        state.unplanned.push(code);
      } else {
        const existsIndex = state.unplanned.indexOf(code);
        if (existsIndex !== -1) {
          state.unplanned.splice(existsIndex, 1);
        }
        state.unplanned.splice(destIndex, 0, code);

        if (existsIndex !== -1) {
          // if was already unplanned don't need to modify other attributes
          localStorage.setItem("planner", JSON.stringify(state));
          return;
        }
      }

      const { plannedFor } = state.courses[code];

      const yearI = parseInt(plannedFor.slice(0, 4), 10) - state.startYear;
      const termI = plannedFor.slice(4);

      state.years[yearI][termI] = state.years[yearI][termI].filter((course) => course !== code);

      state.courses[code].plannedFor = null;
      state.courses[code].isUnlocked = true;
      state.courses[code].warnings = [];
      state.courses[code].handbookNote = "";
      state.courses[code].isAccurate = true;

      localStorage.setItem("planner", JSON.stringify(state));
    },
    unscheduleAll: (state) => {
      Object.entries(state.courses).forEach(([code, desc]) => {
        if (desc.plannedFor !== null) {
          plannerSlice.caseReducers.unschedule(state, { payload: { destIndex: null, code } });
        }
      });
      localStorage.setItem("planner", JSON.stringify(state));
    },
    toggleSummer: (state) => {
      state.isSummerEnabled = !state.isSummerEnabled;

      // TODO: Unsure if we should keep the course in the summer column if hidden
      // For now, keep courses hidden if summer column is also hidden. If we want
      // to remove the courses if summer term is toggled off, then 'term complete'
      // must also be reset.
      // if (!state.isSummerEnabled) {
      //   for (let i = 0; i < state.numYears; i++) {
      //     const courses = state.years[i].T0;
      //     courses.forEach((course) => {
      //       state.courses[course].plannedFor = null;
      //       state.unplanned.push(course);
      //     });
      //     state.years[i].T0 = [];
      //   }
      // }

      localStorage.setItem("planner", JSON.stringify(state));
    },
    toggleTermComplete: (state, action) => {
      const isCompleted = state.completedTerms[action.payload];
      state.completedTerms[action.payload] = !isCompleted;
      localStorage.setItem("planner", JSON.stringify(state));
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
              state.courses[c].plannedFor = null;
              state.courses[c].isUnlocked = true;
            });
          });
        }
      }

      state.startYear = newStartYear;
      state.years = updatedYears;
      localStorage.setItem("planner", JSON.stringify(state));
    },
    updateDegreeLength: (state, action) => {
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
          for (let i = state.numYears - 1; i >= newNumYears; i--) {
            if (state.years[i]) {
              Object.values(state.years[i]).forEach((courses) => {
                courses.forEach((course) => {
                  state.courses[course].plannedFor = null;
                  state.unplanned.push(course);
                });
              });
            }
            // remove year
            state.years.splice(i, 1);
          }
        }

        state.numYears = newNumYears;
        state.hidden = generateHiddenInit(state.startYear, newNumYears);

        localStorage.setItem("planner", JSON.stringify(state));
      }
    },
    hideYear: (state, action) => {
      state.hidden[action.payload] = true;
      state.areYearsHidden = true;
      localStorage.setItem("planner", JSON.stringify(state));
    },
    unhideAllYears: (state) => {
      Object.keys(state.hidden).forEach((year) => {
        state.hidden[year] = false;
      });
      state.areYearsHidden = false;
      localStorage.setItem("planner", JSON.stringify(state));
    },
    resetPlanner: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem("planner");
    },
  },
});

export const {
  addToUnplanned, setUnplannedCourseToTerm, setPlannedCourseToTerm,
  toggleWarnings, setUnplanned, removeCourse, removeCourses, removeAllCourses,
  moveCourse, unschedule, unscheduleAll, toggleSummer, toggleTermComplete,
  updateStartYear, updateDegreeLength, hideYear, unhideAllYears, resetPlanner,
} = plannerSlice.actions;

export default plannerSlice.reducer;
