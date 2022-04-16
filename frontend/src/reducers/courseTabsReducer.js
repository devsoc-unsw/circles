const initial = {
  tabs: [],
  active: 0,
};
const courseTabsReducer = (state = initial, action) => {
  switch (action.type) {
    case "ADD_TAB":
      const tabName = action.payload;
      // If tabName is search, add search and set active to new search
      if (tabName === "search") {
        return {
          tabs: [...state.tabs, "search"],
          active: state.tabs.length,
        };
      }
      // If tabName is not search  && already exists
      const newActive = state.tabs.indexOf(tabName);
      if (state.tabs.find((tab) => tab === tabName)) {
        return {
          ...state,
          active: newActive,
        };
      }

      // Add new tab but don't change active
      return {
        tabs: [...state.tabs, tabName],
        active: state.tabs.length,
      };
    case "REMOVE_TAB":
      const index = parseInt(action.payload, 10);
      const newTabs = [...state.tabs];
      newTabs.splice(index, 1);

      // If only one left, set active to 'explore'
      if (newTabs.length === 1) {
        return {
          tabs: newTabs,
          active: 0,
        };
      }
      const active = parseInt(state.active, 10);

      if (active === 0 || index > active) {
        // deleting the very first tab or a tab after active tab
        return {
          ...state,
          tabs: newTabs,
        };
      }
      // deleting tab before/equal to active tab
      return {
        tabs: newTabs,
        active: active - 1,
      };
    case "SET_ACTIVE_TAB":
      return {
        ...state,
        active: action.payload,
      };
    case "REORDER_TABS":
      return {
        ...state,
        tabs: action.payload,
      };
    case "RESET_COURSE_TABS":
      return initial;
    default:
      return state;
  }
};
export default courseTabsReducer;
