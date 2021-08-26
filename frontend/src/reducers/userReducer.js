const initialState = {
    name: '',
    email: '', // For google auth verification
    year: 0,
    degree: {
        name: 'Computer Science',
        code: '3778',
        length: 3,
        UOC: 144,
        majors: [
            {
                name: 'General',
                code: 'COMPA1'
            }
        ],
        minors: []
    }
}
const userReducer = (state = initialState, action) => { 
    switch (action.type) { 
        case 'SET_UNPLANNED':
            // return { ...state, unplanned: action.payload };
            return { ...state, unplanned: state.unplanned.concat(action.payload) };
        case 'UPDATE_DEGREE': 
            return { ...state, degree: action.payload };
        case 'RESET_DEGREE': 
            return { ...state, degree: initialState };
        default: 
            return state;    
    }
};

export default userReducer