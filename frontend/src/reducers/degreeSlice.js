import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  programCode: "",
  programName: "",
  majors: [],
  minors: [],
  isComplete: false,
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
    addMinor: (state, action) => {
      state.minors.push(action.payload);
    },
    removeMinor: (state, action) => {
      const index = state.minors.indexOf(action.payload);
      if (index !== -1) state.minors.splice(index, 1);
    },
    setIsComplete: (state, action) => {
      state.isComplete = action.payload;
    },
    resetDegree: () => initialState,
  },
});

export const {
  setProgram, resetDegree, addMajor, removeMajor, addMinor, removeMinor, setIsComplete,
} = degreeSlice.actions;

export default degreeSlice.reducer;
