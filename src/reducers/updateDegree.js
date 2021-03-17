const updateDegreeReducer = (state=null, action) => { 
    switch (action.type) { 
        case 'UPDATE': 
            return state = actions.payload; 
        case 'RESET': 
            return state = null;
        default: 
            return state;    
    }
}
export default updateDegreeReducer; 