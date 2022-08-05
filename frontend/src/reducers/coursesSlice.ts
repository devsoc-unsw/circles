import { createSlice } from "@reduxjs/toolkit";
import { CourseDetail, CourseValidation } from "types/courses";

type SliceState = {
  courses: Record<string, CourseValidation>
  course: CourseDetail
}

const initialState: SliceState = {
  courses: {},
  course: null,
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
