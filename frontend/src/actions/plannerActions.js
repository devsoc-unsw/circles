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
        case "SET_YEAR_START":
            return {
                type: "SET_YEAR_START",
                payload: payload,
            };
        case "SET_DEGREE_LENGTH":
            return {
                type: "SET_DEGREE_LENGTH",
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
        case "REMOVE_ALL_COURSES":
            return {
                type: action, 
                payload: null,
            }
        default: 
            return;
    }
};