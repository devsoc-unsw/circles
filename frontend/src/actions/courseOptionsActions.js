export const courseOptionsActions = (action, payload) => {
    switch (action) {
        // NOT IMPLEMENTED IN REDUCER YET.
        // case 'APPEND':
        //     return { 
        //         type: 'APPEND', 
        //         payload: payload
        //     }
        // case 'DELETE':
        //     return { 
        //         type: 'DELETE', 
        //         payload: payload, 
        //     }
        case 'LOAD_PREV_STATE': 
            return {
                type: 'LOAD_PREV_STATE', 
                payload: payload,
            }
        case 'SET_CORE_COURSES': 
            return {
                type: 'SET_CORE_COURSES',
                payload: payload
            }
        default:
            return null;
    }

}

