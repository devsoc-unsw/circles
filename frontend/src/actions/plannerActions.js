export const plannerActions = (action, payload) => {
    switch (action) {
        case 'ADD_TO_UNPLANNED':
            return {
                type: action,
                payload: payload,
            }
        case 'REMOVE_ALL_UNPLANNED':
            return {
                type: action,
                payload
            }
        default: 
            return;
    }
}