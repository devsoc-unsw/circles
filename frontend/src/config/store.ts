import { useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import coursesReducer from 'reducers/coursesSlice';
import courseTabsReducer from 'reducers/courseTabsSlice';
import degreeReducer from 'reducers/degreeSlice';
import plannerReducer from 'reducers/plannerSlice';
import settingsReducer from 'reducers/settingsSlice';
import persistMigrate, { persistVersion } from './migrations';

const rootReducer = combineReducers({
  degree: degreeReducer,
  courseTabs: courseTabsReducer,
  courses: coursesReducer,
  planner: plannerReducer,
  settings: settingsReducer,
});

const persistConfig = {
  key: 'root',
  version: persistVersion,
  storage,
  whitelist: ['degree', 'courses', 'planner', 'settings'],
  migrate: persistMigrate,

};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;
