import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  createMigrate,
  persistReducer,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import axiosRequest from "config/axios";
import coursesReducer from "reducers/coursesSlice";
import courseTabsReducer from "reducers/courseTabsSlice";
import degreeReducer from "reducers/degreeSlice";
import plannerReducer from "reducers/plannerSlice";
import settingsReducer from "reducers/settingsSlice";
import { REDUX_PERSIST_VERSION } from "./constants";
import { useDispatch } from "react-redux";

const rootReducer = combineReducers({
  degree: degreeReducer,
  courseTabs: courseTabsReducer,
  courses: coursesReducer,
  planner: plannerReducer,
  settings: settingsReducer,
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
  1: () => undefined,
  2: (oldState) => {
    const newState = { ...oldState };
    newState.degree.specs = [...newState.degree.majors, ...newState.degree.minors];
    delete newState.degree.majors;
    delete newState.degree.minors;
    return newState;
  },
  3: async (oldState) => {
    const newState = { ...oldState };

    const courses = Object.keys(newState.planner.courses);
    await courses.forEach(async (course, _) => {
      const [formattedData, err] = await axiosRequest("get", `/courses/getCourse/${course}`);
      if (!err) {
        const { code } = formattedData;
        newState.planner.courses[code].is_multiterm = formattedData.is_multiterm;
      }
    });
    return newState;
  },
};

const persistConfig = {
  key: "root",
  version: REDUX_PERSIST_VERSION,
  storage,
  whitelist: ["degree", "courses", "planner"],
  migrate: createMigrate(migrations, { debug: true }),

};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch 

export default store;
