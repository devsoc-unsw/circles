import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import userReducer from "./userReducer";
import degreeReducer from "./degreeReducer";
import plannerReducer from "./plannerReducer";
import updateCoursesReducer from "./updateCourses"
import courseOptionsReducer from "./courseOptionsReducer";
const allReducers = combineReducers({
  courseOptions: courseOptionsReducer,
  updateCourses: updateCoursesReducer,
  planner: plannerReducer,
  degree: degreeReducer,
  user: userReducer,
  theme: themeReducer,
});

export default allReducers;
