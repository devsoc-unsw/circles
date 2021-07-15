const initialState = {
    name: '',
}
const userReducer = (state = initialState, action) => { 
    switch (action.type) { 
        case 'SET_UNPLANNED':
            return { ...state, unplanned: state.unplanned.concat(action.payload) };
        case 'updateDegree': 
            return { ...state, degree: action.payload };
        case 'RESET_DEGREE': 
            return { ...state, degree: initialState };
        default: 
            return state;    
    }
};

export default userReducer