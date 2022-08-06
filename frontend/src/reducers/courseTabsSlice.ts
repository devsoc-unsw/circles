import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    resetTabs: () => initialState,
  },
});

export const {
  addTab, removeTab, setActiveTab, reorderTabs, resetTabs,
} = courseTabsSplice.actions;

export default courseTabsSplice.reducer;
