const initial = {
    tabs: ["explore"],
    active: 0,
}
const courseTabsReducer = (state=initial, action) => { 
    switch (action.type) { 
        case "ADD_TAB":
            const tabName = action.payload
            // If tabName is search, add search and set active to new search 
            if (tabName === 'search') {
                return {
                    tabs: [...state.tabs, "search"], 
                    active: state.tabs.length
                }
            }
            // If tabName is not search  && already exists 
            const newActive = state.tabs.indexOf(tabName);
            if (state.tabs.find(tab => tab === tabName)) {
                return { 
                    ...state,
                    active: newActive
                }
            }

            // Add new tab but don't change active
            return {
                tabs: [...state.tabs, tabName],
                active: state.tabs.length,
            }
        case "REMOVE_TAB":
            const index = action.payload;
            let newTabs = [...state.tabs];
            newTabs.splice(index, 1); 
            // If only one left, set active to 'explore'
            if (newTabs.length === 1) {
                return {
                    tabs: newTabs, 
                    active: 0
                }
            } else {
                return {
                    ...state,
                    tabs: newTabs
                }
            }
        case "SET_ACTIVE_TAB": 
            return {
                ...state,
                active: action.payload
            }
        default: 
            return state;    
    }
}
export default courseTabsReducer; 
