import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  courses: {},
  course: {},
  isLockedEnabled: false,
};

const coursesSplice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
    setCourse: (state, action) => {
      state.course = action.payload;
    },
    toggleCourseLock: (state) => {
      state.isLockedEnabled = !state.isLockedEnabled;
    },
    resetCourses: () => initialState,
  },
});

export const {
  setCourses, setCourse, toggleCourseLock, resetCourses,
} = coursesSplice.actions;

export default coursesSplice.reducer;
