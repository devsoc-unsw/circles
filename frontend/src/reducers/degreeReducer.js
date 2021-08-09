const initial = {
    currStep: 0, 
    program: "",
    specialisation: "",
    minor: "",
}
const degreeReducer = (state=initial, action) => { 
    switch (action.type) { 
        case 'SET_DEGREE': 
            return {
                ...state, 
                program: action.payload
            }; 
        case 'SET_SPECIALISATION': 
            return {
                ...state, 
                specialisation: action.payload
            };  
        case 'SET_MINOR':  
            return {
                ...state,
                minor: action.payload
            }; 
        case 'NEXT_STEP': 
            if (state.currStep >= 3) return state; 
            return {
                ...state,
                currStep: state.currStep + 1
            }; 
        case 'PREV_STEP': 
            if (state.currStep == 1) return state;
            return {
                ...state,
                currStep: state.currStep - 1
            };
        default: 
            return state;    
    }
}
export default degreeReducer; 