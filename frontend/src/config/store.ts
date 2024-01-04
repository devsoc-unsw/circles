import { configureStore } from '@reduxjs/toolkit';
import { combineReducers, PreloadedState } from 'redux';
import storage from 'redux-persist/lib/storage';
import courseTabsReducer from 'reducers/courseTabsSlice';
import settingsReducer from 'reducers/settingsSlice';
import persistMigrate, { persistVersion } from './migrations';

export const rootReducer = combineReducers({
  courseTabs: courseTabsReducer,
  settings: settingsReducer
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState
  });

export const persistConfig = {
  key: 'root',
  version: persistVersion,
  storage,
  whitelist: ['degree', 'courses', 'planner', 'settings'],
  migrate: persistMigrate
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
