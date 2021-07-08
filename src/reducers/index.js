import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import updateCourses from "./updateCourses";
import userReducer from "./userReducer";
const allReducers = combineReducers({
  updateCourses: updateCourses,
  user: userReducer,
  theme: themeReducer,
});

export default allReducers;
