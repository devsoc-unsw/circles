import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Theme = "light" | "dark";

type SliceState = {
  theme: Theme
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
    toggleTheme: (state, action: PayloadAction<Theme>) => {
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
