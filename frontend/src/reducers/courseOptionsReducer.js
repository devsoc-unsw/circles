const initialState = {
    recentlyViewed: [],
    core: [],
    electives: [],
    genEds: []
}
const courseOptionsReudcer = (state = initialState, action) => { 
    switch (action.type) { 
        case 'SET_CORE_COURSES':
            return {...state, core: action.payload};
        // case 'DELETE': 
        //     return state.filter((value, index) => {
        //         return value !== action.payload; 
        //     }); 
        default: 
            return state; 
    }
}

export default courseOptionsReudcer;