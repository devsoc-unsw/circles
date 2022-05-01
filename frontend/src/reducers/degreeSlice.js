import { createSlice } from "@reduxjs/toolkit";
import { DATA_STRUCTURE_VERSION } from "../constants";

/**
 * IMPORTANT NOTE:
 *
 * Since we store the state in local storage, this means that any modifications
 * to the state (i.e. changing the initialState data structure fields, a bug
 * created in the reducer functions that can cause some logic issues, etc.)
 * can have unintended effects for users using a previous version local storage
 * data format. This could cause Circles to break or create some weird behaviours.
 *
 * You must update/increment DATA_STRUCTURE_VERSION value found in `constants.js`
 * to indicate is a breaking change is introduced to make it non compatible with
 * previous versions of local storage data.
 *
 */

let initialState = {
  programCode: "",
  programName: "",
  majors: [],
  minor: "",
  specialisation: "",
  version: DATA_STRUCTURE_VERSION,
};

const degree = JSON.parse(localStorage.getItem("degree"));
if (degree && degree.version === initialState.version) {
  initialState = degree;
} else if (degree && degree.version !== initialState.version) {
  localStorage.setItem("isUpdate", true);
}

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
