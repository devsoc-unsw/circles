import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import userReducer from "./userReducer";
import degreeReducer from "./degreeReducer";
import plannerReducer from "./plannerReducer";
import updateCoursesReducer from "./updateCourses";
import courseTabsReducer from "./courseTabsReducer";
const allReducers = combineReducers({
  degree: degreeReducer,
  tabs: courseTabsReducer,
  updateCourses: updateCoursesReducer,
  planner: plannerReducer,
  user: userReducer,
  theme: themeReducer,
});

export default allReducers;
