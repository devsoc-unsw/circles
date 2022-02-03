import { combineReducers } from "redux";
import themeReducer from "./themeReducer";
import userReducer from "./userReducer";
import degreeReducer from "./degreeReducer";
import plannerReducer from "./plannerReducer";
import coursesReducer from "./coursesReducer";
import courseTabsReducer from "./courseTabsReducer";
const allReducers = combineReducers({
  degree: degreeReducer,
  tabs: courseTabsReducer,
  courses: coursesReducer,
  planner: plannerReducer,
  user: userReducer,
  theme: themeReducer,
});

export default allReducers;
