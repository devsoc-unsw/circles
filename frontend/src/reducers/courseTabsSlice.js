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
        state.active = state.tabs.length - 1;
      }
    },
    removeTab: (state, action) => {
      const index = parseInt(action.payload, 10);
      state.tabs.splice(index, 1);

      const active = parseInt(state.active, 10);

      if (!(active === 0 || index > active)) {
        // deleting tab before/equal to active tab
        state.active = active - 1;
      }
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
