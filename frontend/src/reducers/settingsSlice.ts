import { createSlice } from "@reduxjs/toolkit";

type SliceState = {
  theme: "light" | "dark"
  showMarks: boolean
  showLockedCourses: boolean
  showWarnings: boolean
};

const initialState: SliceState = {
  theme: "light",
  showMarks: false,
  showLockedCourses: false,
  showWarnings: true,
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
