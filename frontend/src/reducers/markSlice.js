/* eslint-disable */
import { createSlice } from "@reduxjs/toolkit";

const markSlice = createSlice({
  name: "marks",
  initialState: "N/A",
  reducers: {
    updateMark(state, action) {
      state.mark = action.payload;
    }  
  }
});

export const { updateMark } = markSlice.actions;

export default markSlice.reducer;
