import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  programCode: "",
  programName: "",
  majors: [],
  minor: "",
  specialisation: "",
};

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
    resetDegree: () => initialState,
  },
});

export const {
  setProgram, setSpecialisation, setMinor, resetDegree,
} = degreeSlice.actions;

export default degreeSlice.reducer;
