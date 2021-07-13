import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import degreeReducer from "./degreeReducer";
import userReducer from "./userReducer";
import courseReducer from './coursesReducer';
const allReducers = combineReducers({
  courses: courseReducer,
  degree: degreeReducer,
  user: userReducer,
  theme: themeReducer,
});

export default allReducers;
