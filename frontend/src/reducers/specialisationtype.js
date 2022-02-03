const specialisationtypeReducer = (state=null, action) => { 
    switch (action.type) { 
        case 'SELECT': 
            return state = 'Artificial Intelligence'; 
        default: 
            return state;    
    }
}
export default specialisationtypeReducer;