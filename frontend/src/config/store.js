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
// import { process_multi_term } from "../../../backend/data/processors/courses_processing.py";
import { REDUX_PERSIST_VERSION } from "./constants";

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
  3: (oldState) => {
    const newState = { ...oldState };
    console.log("old State:");
    console.log(oldState);
    console.log(oldState.planner.courses);
    console.log(typeof (oldState.planner.courses));
    // const courses = oldState.planner.courses.keys();
    const courses = Object.keys(oldState.planner.courses);
    // console.log
    courses.forEach(async (course, _) => {
      console.log("DOING", course);
      const [formattedData, err] = await axiosRequest("get", `/courses/getCourse/${course}`);
      if (!err) {
        const { code } = formattedData;
        console.log(`formattedData for ${code} is`, formattedData);
        newState.planner.courses[code].isMultiterm = formattedData.isMultiterm;
        console.log(`new ${code} is:`, newState.planner.courses[code]);
      } else {
        console.log("UG OH ERROR");
        console.log(err);
      }
    });
    // oldState.courses.array.forEach(async (element) => {
    //   const [formattedData, err] = await axiosRequest("get", `/courses/getCourse/${element}`);
    //   if (!err) {
    //     const { code } = formattedData;
    //     console.log("code", code);
    //     newState.courses[code].is_multiterm = formattedData.is_multiterm;
    //   }
    // });
    console.log("newSatte", newState);
    return newState;
  },
  // 3: (oldState) => {
  //   console.log("in store");
  //   const newState = { ...oldState };

  //   return undefined;
  // },
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

export default store;
