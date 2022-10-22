import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { CourseValidation } from 'types/courses';
import { APICourse } from 'utils/api/types/responses';

type CoursesSliceState = {
  courses: Record<string, CourseValidation>;
  course: APICourse | null;
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
    setCourse: (state, action: PayloadAction<APICourse>) => {
      state.course = action.payload;
    },
    resetCourses: () => initialState
  }
});

export const { setCourses, setCourse, resetCourses } = coursesSplice.actions;

export default coursesSplice.reducer;
