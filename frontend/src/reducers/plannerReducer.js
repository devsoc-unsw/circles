const initialState = {
    unplanned: new Map(),
    planned: new Map(),
    "startYear": 2021,
	"numYears": 3,
	"years": [
        {  "t1":[], "t2":[], "t3":[]},
        {  "t1":[], "t2":[], "t3":[]},
        {  "t1":[], "t2":[], "t3":[]}
    ]
};
const plannerReducer = (state = initialState, action) => { 
    switch (action.type) { 
        case 'SET_COURSES':
            return { ...state, initialCourses: action.payload };
        case 'SET_COURSE':
            return { ...state, course: action.payload };
        case 'ADD_UNPLANNED': 
            console.log('adding course to planner', action.payload);
            return { 
                ...state,
                unplanned: state.unplanned.set(action.payload.courseCode, action.payload.courseData) }; 
        case 'DELETE': 
            return state.filter((value, index) => {
                return value !== action.payload; 
            }); 
        default: 
            return state; 
    }
}

export default plannerReducer;