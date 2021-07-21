import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import updateCourses from "./updateCourses";
import userReducer from "./userReducer";
import degreeReducer from "./degreeReducer"
const allReducers = combineReducers({
  degree: degreeReducer,
  updateCourses: updateCourses,
  user: userReducer,
  theme: themeReducer,
});

export default allReducers;
