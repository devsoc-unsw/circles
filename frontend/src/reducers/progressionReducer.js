const progressionReducer = (state = null, action) => {
    switch (action.type) {
        case 'SET_PROGRESSION': 
            return (state = action.payload)
        default: 
            return state;
    }
}

export default progressionReducer;
