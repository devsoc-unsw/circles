import { createSlice } from "@reduxjs/toolkit";
import { DEGREE_STRUCTURE_VERSION } from "../constants";

let initialState = {
  programCode: "",
  programName: "",
  majors: [],
  minor: "",
  specialisation: "",
  version: DEGREE_STRUCTURE_VERSION,
};

const degree = JSON.parse(localStorage.getItem("degree"));
if (degree) initialState = degree;

const degreeSlice = createSlice({
  name: "degree",
  initialState,
  reducers: {
    setProgram: (state, action) => {
      state.programCode = action.payload.programCode;
      state.programName = action.payload.programName;
    },
    setSpecialisation: (state, action) => {
      state.specialisation = action.payload;
    },
    setMinor: (state, action) => {
      state.minor = action.payload;
    },
    saveDegree: (state) => {
      localStorage.setItem("degree", JSON.stringify(state));
    },
    resetDegree: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem("degree", JSON.stringify(state));
    },
  },
});

export const {
  setProgram, setSpecialisation, setMinor, saveDegree, resetDegree,
} = degreeSlice.actions;

export default degreeSlice.reducer;
