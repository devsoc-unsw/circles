const degreeReducer = (state = null, action) => {
    switch (action.type) {
      case "SET_DEGREE":
        return (state = action.payload);
      default:
        return state;
    }
  };
  export default degreeReducer;
  