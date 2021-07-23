/// FOR DEBUGGING REASONS, I've set initial state
const dummy_degree = {
  code: "3526", 
  name: "This is a dummy degree (From Reducer)"
}
const degreeReducer = (state = dummy_degree, action) => {
    switch (action.type) {
      case "SET_DEGREE":
        return (state = action.payload);
      default:
        return state;
    }
  };
  export default degreeReducer;
  