import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  programCode: "",
  programName: "",
  specs: [],
};

const degreeSlice = createSlice({
  name: "degree",
  initialState,
  reducers: {
    setProgram: (state, action) => {
      state.programCode = action.payload.programCode;
      state.programName = action.payload.programName;
    },
    addSpecialisation: (state, action) => {
      state.specs.push(action.payload);
    },
    removeSpecialisation: (state, action) => {
      const index = state.specs.indexOf(action.payload);
      if (index !== -1) state.specs.splice(index, 1);
    },
    resetDegree: () => initialState,
  },
});

export const {
  setProgram, resetDegree, addSpecialisation, removeSpecialisation,
} = degreeSlice.actions;

export default degreeSlice.reducer;
