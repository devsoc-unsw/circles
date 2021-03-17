export const appendCourse = (payload) => { 
    return { 
        type: 'APPEND', 
        payload: payload
    }
}

export const deleteCourse = (payload) => { 
    return { 
        type: 'DELETE', 
        payload: payload, 
    }
}