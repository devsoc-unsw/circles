const degreeReducer = (state=null, action) => { 
    switch (action.type) { 
        case 'updateDegree': 
            return (state = action.payload); 
        default: 
            return state;    
    }
}
export default degreeReducer; 