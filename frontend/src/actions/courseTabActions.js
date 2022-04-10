const courseTabActions = (action, payload) => {
  switch (action) {
    case "ADD_TAB":
      return {
        type: "ADD_TAB",
        payload,
      };
    case "REMOVE_TAB":
      return {
        type: "REMOVE_TAB",
        payload,
      };
    case "SET_ACTIVE_TAB":
      return {
        type: "SET_ACTIVE_TAB",
        payload,
      };
    default:
      return null;
  }
};

export default courseTabActions;
