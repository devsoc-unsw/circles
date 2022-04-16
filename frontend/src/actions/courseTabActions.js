const courseTabActions = (action, payload) => {
  switch (action) {
    case "ADD_TAB":
    case "REMOVE_TAB":
    case "SET_ACTIVE_TAB":
    case "REORDER_TABS":
      return {
        type: action,
        payload,
      };
    case "RESET_COURSE_TABS":
      return {
        type: action,
      };
    default:
      return null;
  }
};

export default courseTabActions;
