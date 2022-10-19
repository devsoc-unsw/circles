import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { Course } from 'types/api';
import { CourseValidation } from 'types/courses';

export type CoursesSliceState = {
  courses: Record<string, CourseValidation>;
  course: Course | null;
};

const initialState: CoursesSliceState = {
  courses: {},
  course: null
};

const coursesSplice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Record<string, CourseValidation>>) => {
      state.courses = action.payload;
    },
    setCourse: (state, action: PayloadAction<Course>) => {
      state.course = action.payload;
    },
    resetCourses: () => initialState
  }
});

export const { setCourses, setCourse, resetCourses } = coursesSplice.actions;

export default coursesSplice.reducer;
