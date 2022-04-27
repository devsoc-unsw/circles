import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  programCode: "",
  programName: "",
  majors: [],
  minor: "",
  specialisation: "",
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
    toggleUpdatedDegree: (state) => {
      state.hasUpdatedDegree = !state.hasUpdatedDegree;
    },
  },
});

export const {
  setProgram, setSpecialisation, setMinor, toggleUpdatedDegree,
} = degreeSlice.actions;

export default degreeSlice.reducer;
