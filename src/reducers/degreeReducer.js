const degreeReducer = (state=null, action) => { 
    switch (action.type) { 
        case 'UPDATE': 
            return state = action.payload; 
        case 'RESET': 
            return state = null;
        default: 
            return state;    
    }
}
export default degreeReducer; 