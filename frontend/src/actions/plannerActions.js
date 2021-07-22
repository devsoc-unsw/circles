export const plannerActions = (action, payload) => {
    switch (action) {
        case 'ADD_TO_UNPLANNED':
            return {
                type: action,
                payload: payload,
            }
        default: 
            return;
    }
}