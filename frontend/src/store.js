/* eslint-disable */
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  createMigrate,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import coursesReducer from "./reducers/coursesSlice";
import courseTabsReducer from "./reducers/courseTabsSlice";
import degreeReducer from "./reducers/degreeSlice";
import plannerReducer from "./reducers/plannerSlice";
import themeReducer from "./reducers/themeSlice";
import markReducer from "./reducers/markSlice";
import { REDUX_PERSIST_VERSION } from "./constants";

const rootReducer = combineReducers({
  degree: degreeReducer,
  courseTabs: courseTabsReducer,
  courses: coursesReducer,
  planner: plannerReducer,
  theme: themeReducer,
});

/**
 * IMPORTANT NOTE:
 *
 * Since we store the state to local storage via redux-persist, this means that
 * any modifications to the state (i.e. changing the initialState data structure
 * fields, a bug created in the reducer functions that can cause some logic
 * issues, etc.) can have unintended effects for users using a previous version local
 * storage data format. This could cause Circles to break or create some weird behaviours.
 *
 * You must update/increment REDUX_STRUCTURE_VERSION value found in `constants.js`
 * to indicate is a breaking change is introduced to make it non compatible with
 * previous versions of local storage data.
 *
 */

// migration schema used to translate structure - return undefined to reset initialState
const migrations = {
  0: () => undefined,
  // 1: () => undefined,
};

const persistConfig = {
  key: "root",
  version: REDUX_PERSIST_VERSION,
  storage,
  whitelist: ["degree", "courses", "planner", "theme"],
  migrate: createMigrate(migrations, { debug: true }),

};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;
