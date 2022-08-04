import { createSlice } from "@reduxjs/toolkit";

type SliceState = {
  tabs: string[]
  active: number
};

const initialState: SliceState = {
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
        state.tabs.push(tabName);
        state.active = state.tabs.length - 1;
      }
    },
    removeTab: (state, action) => {
      const index = parseInt(action.payload, 10);

      if (index >= 0) {
        state.tabs.splice(index, 1);
        if (state.active && state.active >= state.tabs.length) {
          state.active = state.tabs.length - 1;
        }
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
