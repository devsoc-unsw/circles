const themeReducer = (state = "light", action) => {
  switch (action.type) {
    case "toggleTheme":
      return (state = action.payload);
    default:
      return state;
  }
};
export default themeReducer;
