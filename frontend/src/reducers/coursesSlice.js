import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  courses: {},
  course: {},
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
    resetCourses: () => initialState,
  },
});

export const {
  setCourses, setCourse, resetCourses,
} = coursesSplice.actions;

export default coursesSplice.reducer;
