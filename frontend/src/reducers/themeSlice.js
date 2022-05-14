import { createSlice } from "@reduxjs/toolkit";

const initialState = "light";

const themeSplice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state, action) => action.payload,
  },
});

export const { toggleTheme } = themeSplice.actions;

export default themeSplice.reducer;
