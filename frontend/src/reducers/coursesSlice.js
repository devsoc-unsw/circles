import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  courses: {},
  course: {},
  isLockedEnabled: false,
};

const courses = JSON.parse(localStorage.getItem("courses"));
if (courses && courses.version === initialState.version) {
  initialState = courses;
} else if (courses && courses.version !== initialState.version) {
  localStorage.setItem("isUpdate", true);
}

const coursesSplice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
      localStorage.setItem("courses", JSON.stringify(state));
    },
    setCourse: (state, action) => {
      state.course = action.payload;
      localStorage.setItem("courses", JSON.stringify(state));
    },
    toggleCourseLock: (state) => {
      state.isLockedEnabled = !state.isLockedEnabled;
      localStorage.setItem("courses", JSON.stringify(state));
    },
    resetCourses: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem("courses", JSON.stringify(state));
    },
  },
});

export const {
  setCourses, setCourse, toggleCourseLock, resetCourses,
} = coursesSplice.actions;

export default coursesSplice.reducer;
