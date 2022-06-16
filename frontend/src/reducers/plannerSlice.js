import { createSlice } from "@reduxjs/toolkit";
import { getTermsList } from "pages/TermPlanner/utils";

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

const fakeStartYear = parseInt(new Date().getFullYear(), 10);
const fakeNumYears = 3;

const initialState = {
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
    },
    toggleWarnings: (state, action) => {
      Object.keys(action.payload).forEach((course) => {
        if (state.courses[course]) {
          const {
            is_accurate: isAccurate, unlocked, warnings, handbook_note: handbookNote, supressed,
          } = action.payload[course];

          state.courses[course].isAccurate = isAccurate;
          state.courses[course].isUnlocked = unlocked;
          state.courses[course].warnings = warnings;
          state.courses[course].handbookNote = handbookNote;
          state.courses[course].supressed = supressed;
        }
      });
    },
    setUnplannedCourseToTerm: (state, action) => {
      const {
        destRow, destTerm, destIndex, course,
      } = action.payload;
      state.unplanned = state.unplanned.filter(
        (c) => c !== course,
      );
      if (state.courses[course].isMultiterm) {
        const termsList = getTermsList(destTerm, state.courses[course].UOC, state.isSummerEnabled);
        termsList.forEach((termRow) => {
          const { term, rowOffset } = termRow;
          const index = state.years[destRow + rowOffset][term].length;
          state.years[destRow + rowOffset][term].splice(index, 0, course);
        });
      } else {
        state.years[destRow][destTerm].splice(destIndex, 0, course);
      }
    },
    setPlannedCourseToTerm: (state, action) => {
      const {
        srcRow, srcTerm, srcIndex,
        destRow, destTerm, destIndex, course,
      } = action.payload;
      state.years[srcRow][srcTerm].splice(srcIndex, 1);
      state.years[destRow][destTerm].splice(destIndex, 0, course);
    },
    moveCourse: (state, action) => {
      const { course, term } = action.payload;
      if (state.courses[course]) {
        state.courses[course].plannedFor = term;
      }
    },
    updateCourseMark: (state, action) => {
      const { code, mark } = action.payload;

      if (state.courses[code]) {
        state.courses[code].mark = mark;
      }
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
    },
    unscheduleAll: (state) => {
      Object.entries(state.courses).forEach(([code, desc]) => {
        if (desc.plannedFor !== null) {
          plannerSlice.caseReducers.unschedule(state, { payload: { destIndex: null, code } });
        }
      });
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
    },
    toggleTermComplete: (state, action) => {
      const isCompleted = state.completedTerms[action.payload];
      state.completedTerms[action.payload] = !isCompleted;
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
      }
    },
    hideYear: (state, action) => {
      state.hidden[action.payload] = true;
      state.areYearsHidden = true;
    },
    unhideAllYears: (state) => {
      Object.keys(state.hidden).forEach((year) => {
        state.hidden[year] = false;
      });
      state.areYearsHidden = false;
    },
    resetPlanner: () => initialState,
  },
});

export const {
  addToUnplanned, setUnplannedCourseToTerm, setPlannedCourseToTerm,
  toggleWarnings, setUnplanned, removeCourse, removeCourses, removeAllCourses,
  moveCourse, unschedule, unscheduleAll, toggleSummer, toggleTermComplete,
  updateStartYear, updateDegreeLength, hideYear, unhideAllYears, resetPlanner,
  updateCourseMark,
} = plannerSlice.actions;

export default plannerSlice.reducer;
