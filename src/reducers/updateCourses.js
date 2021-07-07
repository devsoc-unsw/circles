const initialState = {
    courses: {}
};
const updateCoursesReducer = (state = initialState, action) => { 
    switch (action.type) { 
        case 'APPEND': 
            return state.append(action.payload); 
        case 'DELETE': 
            return state.filter((value, index) => {
                return value != action.payload; 
            }); 
        default: 
            return state; 
    }
}

export default updateCoursesReducer; 