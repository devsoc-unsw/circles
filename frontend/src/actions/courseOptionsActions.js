export const courseOptionsActions = (action, payload) => {
    console.log('ACTUZZz', action);
    switch (action) {
        // NOT IMPLEMENTED IN REDUCER YET.
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
        case 'SET_ELECTIVE_COURSES': 
            return {
                type: 'SET_ELECTIVE_COURSES',
                payload: payload
            }
        case 'SET_GENED_COURSES': 
            return {
                type: 'SET_GENED_COURSES',
                payload: payload
            }
        case 'APPEND_COURSE':
            console.log('APEEEEEND', payload);
            return {
                type: 'APPEND_COURSE',
                payload: payload
            }
        default:
            return null;
    }

}