const initial = {
    tabs: ["explore"], 
    active: "explore"
}
const courseTabsReducer = (state=initial, action) => { 
    switch (action.type) { 
        case "ADD_TAB":
            return {
                ...state,
                tabs: [...state.tabs, action.payload]
            }
        case "REMOVE_TAB":
            // Payload gives index
            const { index } = action.payload;
            let newTabs = [...state.tabs];
            console.log(newTabs);
            newTabs.splice(index, 1); 
            const currActiveIndex = state.tabs.indexOf(state.active);
            console.log('curr active', state.active);
            console.log('index of active', state.tabs.indexOf(state.active));
            console.log('index to delete', index);
            // console.log(newTabs, currActiveIndex, index);
            if (currActiveIndex === index && newTabs.length) {
                return {
                    tabs: newTabs, 
                    active: newTabs[index]
                }
            }
            // Only update the tabs, active tab will not change
            return {
                ...state,
                tabs: newTabs
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
