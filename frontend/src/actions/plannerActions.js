export const plannerActions = (action, payload) => {
    switch (action) {
        case 'ADD_UNPLANNED':
            return { 
                type: 'ADD_UNPLANNED', 
                payload: payload
            }
        case 'DELETE':
            return { 
                type: 'DELETE', 
                payload: payload, 
            }
        case 'SET_COURSES': 
            return {
                type: 'SET_COURSES',
                payload: payload
            }
        case 'SET_CORE_COURSES': 
            console.log('SETTING CORE', payload)
            return {
                type: 'SET_CORE_COURSES',
                payload: payload
            }
        default:
            return null;
    }

}

