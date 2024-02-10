import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

type SettingsSliceState = {
  theme: string;
  showMarks: boolean;
  showLockedCourses: boolean;
  showWarnings: boolean;
  token: string | null;
};

// TODO: when other slices get removed, make these base level, and blacklist the token from persist
export const initialSettingsState: SettingsSliceState = {
  theme: 'light',
  showMarks: false,
  showLockedCourses: false,
  showWarnings: true,
  token: null
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
    toggleShowWarnings: (state) => {
      state.showWarnings = !state.showWarnings;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    }
  }
});

export const { toggleTheme, toggleShowMarks, toggleLockedCourses, toggleShowWarnings, setToken } =
  settingsSlice.actions;

export default settingsSlice.reducer;
