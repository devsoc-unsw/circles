import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type CourseTabsSliceState = {
  tabs: string[];
  active: number;
};

export const initialCourseTabsState: CourseTabsSliceState = {
  tabs: [], // list of course codes i.e. ['COMP1511', 'COMP1521']
  active: 0 // index of the active tab in the tabs array
};

const courseTabsSplice = createSlice({
  name: 'courseTabs',
  initialState: initialCourseTabsState,
  reducers: {
    addTab: (state, action: PayloadAction<string>) => {
      const tabName = action.payload;
      if (state.tabs.find((tab) => tab === tabName)) {
        state.active = state.tabs.indexOf(tabName);
      } else {
        state.tabs.push(tabName);
        state.active = state.tabs.length - 1;
      }
    },
    removeTab: (state, action: PayloadAction<number>) => {
      const tabIndex = action.payload;

      if (tabIndex >= 0) {
        state.tabs.splice(tabIndex, 1);
        if (state.active && state.active >= state.tabs.length) {
          state.active = state.tabs.length - 1;
        }
      }
    },
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.active = action.payload;
    },
    reorderTabs: (state, action: PayloadAction<string[]>) => {
      state.tabs = action.payload;
    },
    resetTabs: () => initialCourseTabsState
  }
});

export const { addTab, removeTab, setActiveTab, reorderTabs, resetTabs } = courseTabsSplice.actions;

export default courseTabsSplice.reducer;
