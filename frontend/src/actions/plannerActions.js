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
        // case 'GET_COURSE_BY_ID':
        //     return (dispatch) => {
        //         axios({
        //             method: 'get',
        //             url: 'http://localhost:3000/courses.json'
        //         })
        //         .then(({ data }) => {
        //             // REVIEW COMMENT: You should use .filter here because .map expects a return value.
        //             Object.keys(data).map(course => {
        //                 if (course === id) {
        //                     dispatch(setCourse(data[course]));
        //                 }
        //                 return;
        //             })
        //         })
        //         .catch(console.log);
        //     }
        default:
            return null;
    }

}

