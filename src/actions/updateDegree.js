export const updateDegree = (payload) => { 
    return { 
        type: 'UPDATE', 
        payload: payload
    }
}

export const resetDegree = () => { 
    return { 
        type: 'RESET'
    }
}   