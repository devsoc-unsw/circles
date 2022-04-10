const degreeActions = (action, payload) => {
  switch (action) {
    case "SET_PROGRAM":
      return {
        type: "SET_PROGRAM",
        payload,
      };
    case "SET_SPECIALISATION":
      return {
        type: "SET_SPECIALISATION",
        payload,
      };
    case "SET_MINOR":
      return {
        type: "SET_MINOR",
        payload,
      };
    case "NEXT_STEP":
      return {
        type: "NEXT_STEP",
        payload: null,
      };
    case "PREV_STEP":
      return {
        type: "PREV_STEP",
        payload: null,
      };
    default:
      return null;
  }
};

export default degreeActions;
