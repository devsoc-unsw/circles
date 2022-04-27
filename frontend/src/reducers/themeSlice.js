import { createSlice } from "@reduxjs/toolkit";

const initialState = "light";

const themeSplice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state, action) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { toggleTheme } = themeSplice.actions;

export default themeSplice.reducer;
