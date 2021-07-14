export const courseOptionsActions = (action, payload) => {
    switch (action) {
        case 'APPEND':
            return { 
                type: 'APPEND', 
                payload: payload
            }
        case 'DELETE':
            return { 
                type: 'DELETE', 
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

