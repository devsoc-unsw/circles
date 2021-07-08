import updateCoursesReducer from "./updateCourses";
import degreeReducer from "./degree";
import degreetypeReducer from "./degreetype";
import themeReducer from "./themeReducer";
import { combineReducers } from "redux";
const allReducers = combineReducers({
  degree: degreeReducer,
  degreetype: degreetypeReducer,
  updateCourses: updateCoursesReducer,
  theme: themeReducer,
});

export default allReducers;
