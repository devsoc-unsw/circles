const degreetypeReducer = (state=null, action) => { 
    switch (action.type) { 
        case 'SELECT': 
            return state = 'Bachelor of Computer Science'; 
        default: 
            return state;    
    }
}
export default degreetypeReducer;