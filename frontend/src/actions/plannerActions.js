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
        case "SET_YEARS":
            return {
                type: "SET_YEARS",
                payload: payload,
            };
        case "SET_UNPLANNED":
            return {
                type: action,
                payload: payload,
            };
        case "REMOVE_COURSE":
            return {
                type: action, 
                payload: payload,
            }
        default: 
            return;
    }
};