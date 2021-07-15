import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import degreeReducer from "./degreeReducer";
import userReducer from "./userReducer";
import plannerReducer from './plannerReducer';
import courseOptionsReducer from "./courseOptionsReducer";

const allReducers = combineReducers({
  planner: plannerReducer,
  courseOptions: courseOptionsReducer,
  degree: degreeReducer,
  user: userReducer,
  theme: themeReducer,
});


export default allReducers;
