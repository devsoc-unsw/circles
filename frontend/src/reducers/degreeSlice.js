import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  programCode: "",
  programName: "",
  majors: [],
  minor: "",
};

const degreeSlice = createSlice({
  name: "degree",
  initialState,
  reducers: {
    setProgram: (state, action) => {
      state.programCode = action.payload.programCode;
      state.programName = action.payload.programName;
    },
    addMajor: (state, action) => {
      state.majors.push(action.payload);
    },
    removeMajor: (state, action) => {
      const index = state.majors.indexOf(action.payload);
      if (index !== -1) state.majors.splice(index, 1);
    },
    setMinor: (state, action) => {
      state.minor = action.payload;
    },
    resetDegree: () => initialState,
  },
});

export const {
  setProgram, setMinor, resetDegree, addMajor, removeMajor,
} = degreeSlice.actions;

export default degreeSlice.reducer;
