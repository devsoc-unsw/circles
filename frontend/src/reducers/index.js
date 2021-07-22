import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import updateCourses from "./updateCourses";
import userReducer from "./userReducer";
import plannerReducer from "./plannerReducer";

const allReducers = combineReducers({
  updateCourses: updateCourses,
  user: userReducer,
  theme: themeReducer,
  planner: plannerReducer,
});

export default allReducers;
