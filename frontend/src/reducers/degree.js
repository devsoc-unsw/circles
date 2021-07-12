const degreeReducer = (state=null, action) => { 
    switch (action.type) { 
        case 'SELECT': 
            return state = "Undergraduate"; 
        default: 
            return state;    
    }
}
export default degreeReducer; 