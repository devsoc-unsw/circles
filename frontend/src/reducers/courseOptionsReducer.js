const initialState = {
    recentlyViewed: [],
    core: [],
    electives: [],
    genEds: []
}
const courseOptionsReducer = (state = initialState, action) => { 
    switch (action.type) { 
        case 'LOAD_PREV_STATE':
            return action.payload;
        case 'SET_RECENTLY_VIEWED_COURSES':
            return { ...state, recentlyViewed: action.payload };
        case 'SET_CORE_COURSES':
            return { ...state, core: action.payload };
        case 'SET_ELECTIVE_COURSES':
            return { ...state, electives: action.payload };
        case 'SET_GENED_COURSES':
            return { ...state, genEds: action.payload };
        case 'APPEND_COURSE':
            const type = action.payload[Object.keys(action.payload)[0]].type;
            const arr = [...state[type]];
            arr.push(action.payload);
            return { ...state, [type]: arr };
        // case 'DELETE': 
        //     return state.filter((value, index) => {
        //         return value !== action.payload; 
        //     }); 
        default: 
            return state; 
    }
}

export default courseOptionsReducer;
