const plannerActions = (action, payload) => {
  switch (action) {
    case "ADD_TO_UNPLANNED":
    case "ADD_TO_PLANNED":
    case "ADD_CORE_COURSES":
    case "REMOVE_ALL_UNPLANNED":
    case "SET_START_YEAR":
    case "SET_NUM_YEARS":
    case "SET_DEGREE_LENGTH":
    case "SET_UNPLANNED":
    case "REMOVE_COURSE":
    case "SET_YEARS":
    case "TOGGLE_WARNINGS":
    case "UPDATE_PLANNED_COURSES":
    case "MOVE_COURSE":
    case "UNSCHEDULE":
    case "UNSCHEDULE_ALL":
    case "TOGGLE_TERM_COMPLETE":
    case "UPDATE_START_YEAR":
    case "HIDE_YEAR":
    case "UNHIDE_ALL_YEARS":
    case "LOAD_PLANNER":
      return {
        type: action,
        payload,
      };
    case "REMOVE_ALL_COURSES":
    case "TOGGLE_SUMMER":
    case "RESET_PLANNER":
      return {
        type: action,
      };
    default:
      return {};
  }
};

export default plannerActions;
