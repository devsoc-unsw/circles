export const courseTabActions = (action, payload) => {
    switch (action) {
        case 'ADD_TAB': 
            return {
                type: 'ADD_TAB', 
                payload: payload
            }
        case 'REMOVE_TAB': 
            return {
                type: 'REMOVE_TAB', 
                payload: payload
            }
        case 'SET_ACTIVE_TAB': 
            return {
                type: 'SET_ACTIVE_TAB',
                payload: payload,
            }
        default: 
            return null;
    }
} 

