import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { APICourse, APICourseState } from 'utils/api/types/responses';

type CoursesSliceState = {
  courses: Record<string, APICourseState>;
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
    setCourses: (state, action: PayloadAction<Record<string, APICourseState>>) => {
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
