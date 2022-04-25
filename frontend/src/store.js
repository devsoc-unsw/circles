import { configureStore } from "@reduxjs/toolkit";
import coursesReducer from "./reducers/coursesSlice";
import courseTabsReducer from "./reducers/courseTabsSlice";
import degreeReducer from "./reducers/degreeSlice";
import plannerReducer from "./reducers/plannerSlice";
import themeReducer from "./reducers/themeSlice";

export default configureStore({
  reducer: {
    degree: degreeReducer,
    tabs: courseTabsReducer,
    courses: coursesReducer,
    planner: plannerReducer,
    theme: themeReducer,
  },
});
