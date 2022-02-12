const initialState = {
  courses: {},
  course: {},
};
const coursesReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_COURSES":
      return { ...state, courses: action.payload };
    case "SET_COURSE":
      return { ...state, course: action.payload };
    case "APPEND":
      return state.append(action.payload);
    case "DELETE":
      return state.filter((value, index) => {
        return value !== action.payload;
      });
    default:
      return state;
  }
};
export default coursesReducer;
