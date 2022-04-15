const themeReducer = (state = "light", action) => {
  switch (action.type) {
    case "theme":
      return action.payload;
    default:
      return state;
  }
};
export default themeReducer;
