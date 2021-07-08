export const updateDegree = (degree) => { 
    return { 
        type: 'UPDATE_DEGREE', 
        payload: degree
    }
}

export const resetDegree = () => { 
    return { 
        type: 'RESET_DEGREE'
    }
}   

export const getDegree = () => {
    return (dispatch) => {
        // dispatch(updateDegree(data));
    }
}