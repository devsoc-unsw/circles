export const plannerActions = (action, payload) => {
  switch (action) {
    // Takes
    case "ADD_TO_UNPLANNED":
      return {
        type: action,
        payload: payload,
      };
    case "ADD_CORE_COURSES":
      return {
        type: action,
        payload: payload,
      };
    case "REMOVE_ALL_UNPLANNED":
      return {
        type: action,
        payload,
      };
    case "SET_START_YEAR":
      return {
        type: "SET_START_YEAR",
        payload: payload,
      };
    case "SET_NUM_YEARS":
      return {
        type: "SET_NUM_YEARS",
        payload: payload,
      };
    case "SET_DEGREE_LENGTH":
      return {
        type: "SET_DEGREE_LENGTH",
        payload: payload,
      };
    case "SET_UNPLANNED":
      return {
        type: action,
        payload: payload,
      };
    case "REMOVE_COURSE":
      return {
        type: action,
        payload: payload,
      };
    case "REMOVE_ALL_COURSES":
      return {
        type: action,
        payload: null,
      };
    case "SET_YEARS":
      return {
        type: "SET_YEARS",
        payload: payload,
      };
    case "UPDATE_PLANNED_COURSES":
      return {
        type: action,
        payload: payload,
      };
    case "MOVE_COURSE":
      return {
        type: action,
        payload: payload,
      };
    case "UNSCHEDULE":
      return {
        type: action,
        payload: payload,
      };
    case "TOGGLE_SUMMER":
      return {
        type: action,
      };
    case "TOGGLE_TERM_COMPLETE":
      return {
        type: action,
        payload: payload,
      };
    case "UPDATE_START_YEAR":
      return {
        type: action,
        payload: payload,
      };

    default:
      return;
  }
};
