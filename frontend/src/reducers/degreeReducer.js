let initial = {
  programCode: "",
  programName: "",
  majors: [],
  minor: [],
  specialisation: "",
};

const degree = JSON.parse(localStorage.getItem("degree"));
if (degree) initial = degree;

const degreeReducer = (state = initial, action) => {
  switch (action.type) {
    case "SET_PROGRAM":
      return {
        ...state,
        programCode: action.payload.programCode,
        programName: action.payload.programName,
      };
    case "SET_SPECIALISATION":
      return {
        ...state,
        specialisation: action.payload,
      };
    case "SET_MINOR":
      return {
        ...state,
        minor: action.payload,
      };
    case "TOGGLE_UPDATED_DEGREE":
      const currState = state.hasUpdatedDegree;
      return {
        ...state,
        hasUpdatedDegree: !currState,
      };
    default:
      return state;
  }
};
export default degreeReducer;
