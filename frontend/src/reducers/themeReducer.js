const themeReducer = (state = "light", action) => {
  switch (action.type) {
    case "theme":
      return (state = action.payload);
    default:
      return state;
  }
};
export default themeReducer;
