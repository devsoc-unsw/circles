const themeReducer = (state = "light", action) => {
  switch (action.type) {
    case "toggleTheme":
      window.localStorage.setItem("theme", JSON.stringify(action.payload));
      return (state = action.payload);
    default:
      return state;
  }
};
export default themeReducer;
