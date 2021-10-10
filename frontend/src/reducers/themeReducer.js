const themeReducer = (state = "light", action) => {
  switch (action.type) {
    case "toggleTheme":
      console.log('theme toggle payload', action.payload)
      return (state = action.payload);
    default:
      return state;
  }
};
export default themeReducer;
