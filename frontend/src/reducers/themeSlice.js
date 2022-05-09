import { createSlice } from "@reduxjs/toolkit";

const initialState = localStorage.getItem("theme") || "light";

const themeSplice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state, action) => {
      localStorage.setItem("theme", action.payload);
      return action.payload;
    },
  },
});

export const { toggleTheme } = themeSplice.actions;

export default themeSplice.reducer;
