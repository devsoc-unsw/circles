const degreetypeReducer = (state=null, action) => { 
    switch (action.type) { 
        case 'SELECT': 
            return state = action.payload; 
        default: 
            return state;    
    }
}
export default degreetypeReducer;