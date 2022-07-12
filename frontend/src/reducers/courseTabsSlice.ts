import { createSlice } from "@reduxjs/toolkit";

type CourseTabsSlice = {
  tabs: string[]
  active: number
};

const initialState: CourseTabsSlice = {
  tabs: [],
  active: 0,
};

const courseTabsSplice = createSlice({
  name: "courseTabs",
  initialState,
  reducers: {
    addTab: (state, action) => {
      const tabName = action.payload;
      if (state.tabs.find((tab) => tab === tabName)) {
        state.active = state.tabs.indexOf(tabName);
      } else {
        // Add new tab but don't change active
        state.tabs.push(tabName);
        state.active = state.tabs.length - 1;
      }
    },
    removeTab: (state, action) => {
      const index = parseInt(action.payload, 10);
      state.tabs.splice(index, 1);

      if (!(state.active === 0 || index > state.active)) {
        // deleting tab before/equal to active tab
        state.active -= 1;
      }
    },
    setActiveTab: (state, action) => {
      state.active = action.payload;
    },
    reorderTabs: (state, action) => {
      state.tabs = action.payload;
    },
    resetTabs: () => initialState,
  },
});

export const {
  addTab, removeTab, setActiveTab, reorderTabs, resetTabs,
} = courseTabsSplice.actions;

export default courseTabsSplice.reducer;
