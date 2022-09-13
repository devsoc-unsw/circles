import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

type SettingsSliceState = {
  theme: Theme
  showMarks: boolean
  showLockedCourses: boolean
  showWarnings: boolean
  token: string
};

const initialState: SettingsSliceState = {
  theme: 'light',
  showMarks: false,
  showLockedCourses: false,
  showWarnings: true,
  token: '',
};

const settingsSlice = createSlice({
  name: 'settings',
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
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const {
  toggleTheme, toggleShowMarks, toggleLockedCourses, toggleShowWarnings, setToken,
} = settingsSlice.actions;

export default settingsSlice.reducer;
