const degreeActions = (action, payload) => {
  switch (action) {
    case "SET_PROGRAM":
    case "SET_SPECIALISATION":
    case "SET_MINOR":
      return {
        type: action,
        payload,
      };
    case "NEXT_STEP":
    case "PREV_STEP":
      return {
        type: "NEXT_STEP",
        payload: null,
      };
    default:
      return null;
  }
};

export default degreeActions;
