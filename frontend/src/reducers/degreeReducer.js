const initial = {
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
        case 'TOGGLE_UPDATED_DEGREE': 
            const currState = state.hasUpdatedDegree;
            return {
                ...state,
                hasUpdatedDegree: !currState
            }
        default: 
            return state;    
    }
}
export default degreeReducer; 
