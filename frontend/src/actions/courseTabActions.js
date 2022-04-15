const courseTabActions = (action, payload) => {
  switch (action) {
    case "ADD_TAB":
    case "REMOVE_TAB":
    case "SET_ACTIVE_TAB":
      return {
        type: action,
        payload,
      };
    default:
      return null;
  }
};

export default courseTabActions;
