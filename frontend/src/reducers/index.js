import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import degreeReducer from "./degreeReducer";
import userReducer from "./userReducer";
import courseReducer from './coursesReducer';
import courseOptionsReudcer from "./courseOptionsReducer";

const allReducers = combineReducers({
  courses: courseReducer,
  courseOptions: courseOptionsReudcer,
  degree: degreeReducer,
  user: userReducer,
  theme: themeReducer,
});


export default allReducers;
