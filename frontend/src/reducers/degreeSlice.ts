import { createSlice } from "@reduxjs/toolkit";

type SliceState = {
  programCode: string
  programName: string
  specs: string[]
  isComplete: boolean
};

const initialState: SliceState = {
  programCode: "",
  programName: "",
  specs: [],
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
    addSpecialisation: (state, action) => {
      state.specs.push(action.payload);
    },
    removeSpecialisation: (state, action) => {
      const index = state.specs.indexOf(action.payload);
      if (index !== -1) state.specs.splice(index, 1);
    },
    setIsComplete: (state, action) => {
      state.isComplete = action.payload;
    },
    resetDegree: () => initialState,
  },
});

export const {
  setProgram, resetDegree, addSpecialisation, removeSpecialisation, setIsComplete,
} = degreeSlice.actions;

export default degreeSlice.reducer;
