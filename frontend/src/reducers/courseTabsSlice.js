import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tabs: [],
  active: 0,
};

const courseTabsSplice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    addTab: (state, action) => {
      const tabName = action.payload;
      if (state.tabs.find((tab) => tab === tabName)) {
        state.active = state.tabs.indexOf(tabName);
      } else {
        // Add new tab but don't change active
        state.tabs.push(tabName);
        state.active = state.tabs.length;
      }
    },
    removeTab: (state, action) => {
      const index = parseInt(action.payload, 10);
      const newTabs = [...state.tabs];
      newTabs.splice(index, 1);

      // If only one left, set active to 'explore'
      if (newTabs.length === 1) {
        state.active = 0;
        state.tabs = newTabs;
        return state;
      }
      const active = parseInt(state.active, 10);

      if (active === 0 || index > active) {
        // deleting the very first tab or a tab after active tab
        state.tabs = newTabs;
        return state;
      }
      // deleting tab before/equal to active tab
      state.tabs = newTabs;
      state.active = active - 1;
      return state;
    },
    setActiveTab: (state, action) => {
      state.active = action.payload;
    },
    reorderTabs: (state, action) => {
      state.tabs = action.payload;
    },
    resetTabs: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  addTab, removeTab, setActiveTab, reorderTabs, resetTabs,
} = courseTabsSplice.actions;

export default courseTabsSplice.reducer;
