import updateCoursesReducer from "./updateCourses";
// import degreeReducer from "./degreeReducer";
import themeReducer from "./themeReducer";
import { combineReducers } from "redux";
const allReducers = combineReducers({
  // degree: degreeReducer,
  updateCourses: updateCoursesReducer,
  theme: themeReducer,
});

export default allReducers;
