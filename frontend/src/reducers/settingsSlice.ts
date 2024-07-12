import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

type SettingsSliceState = {
  theme: string;
  showMarks: boolean;
  showLockedCourses: boolean;
  showPastWarnings: boolean;
};

export const initialSettingsState: SettingsSliceState = {
  theme: 'light',
  showMarks: false,
  showLockedCourses: false,
  showPastWarnings: true
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettingsState,
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
    toggleShowPastWarnings: (state) => {
      state.showPastWarnings = !state.showPastWarnings;
    }
  }
});

export const { toggleTheme, toggleShowMarks, toggleLockedCourses, toggleShowPastWarnings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
