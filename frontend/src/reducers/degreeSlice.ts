import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type DegreeSliceState = {
  programCode: string
  programName: string
  specs: string[]
  isComplete: boolean
};

const initialState: DegreeSliceState = {
  programCode: '',
  programName: '',
  specs: [],
  isComplete: false,
};

const degreeSlice = createSlice({
  name: 'degree',
  initialState,
  reducers: {
    setProgram: (state, action: PayloadAction<{ programCode: string, programName: string }>) => {
      state.programCode = action.payload.programCode;
      state.programName = action.payload.programName;
    },
    addSpecialisation: (state, action: PayloadAction<string>) => {
      state.specs.push(action.payload);
    },
    removeSpecialisation: (state, action: PayloadAction<string>) => {
      const index = state.specs.indexOf(action.payload);
      if (index !== -1) state.specs.splice(index, 1);
    },
    setIsComplete: (state, action: PayloadAction<boolean>) => {
      state.isComplete = action.payload;
    },
    resetDegree: () => initialState,
  },
});

export const {
  setProgram, resetDegree, addSpecialisation, removeSpecialisation, setIsComplete,
} = degreeSlice.actions;

export default degreeSlice.reducer;
