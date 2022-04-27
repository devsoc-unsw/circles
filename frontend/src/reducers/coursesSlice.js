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
  },
});

export const {
  setCourses, setCourse,
} = coursesSplice.actions;

export default coursesSplice.reducer;
