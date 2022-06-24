import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
  showMarks: false,
  showLockedCourses: false,
  showWarnings: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleShowMarks: (state) => {
      state.showMarks = !state.showMarks;
    },
    toggleLockedCourses: (state) => {
      state.showLockedCourses = !state.showLockedCourses;
    },
    toggleShowWarnings: (state) => {
      state.showWarnings = !state.showWarnings;
    },
  },
});

export const {
  toggleTheme, toggleShowMarks, toggleLockedCourses, toggleShowWarnings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
