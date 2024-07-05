import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

type SettingsSliceState = {
  theme: string;
  showMarks: boolean;
  showLockedCourses: boolean;
  showPastWarnings: boolean;
  token: string;
};

export const initialSettingsState: SettingsSliceState = {
  theme: 'light',
  showMarks: false,
  showLockedCourses: false,
  showPastWarnings: true,
  token: ''
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
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    }
  }
});

export const {
  toggleTheme,
  toggleShowMarks,
  toggleLockedCourses,
  toggleShowPastWarnings,
  setToken
} = settingsSlice.actions;

export default settingsSlice.reducer;
