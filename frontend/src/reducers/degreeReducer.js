const initalState = {
    'program': {
        'code': '3778',
        'name': 'Bachelor of Computer Science',
    }, 
    // specialisation: null (When the program does not have specialisations)
    'specialisation': {
        'code': 'COMPD1',
        'name': 'Database Systems',
    }
}

const degreeReducer = (state=initalState, action) => { 
    switch (action.type) { 
        case 'updateDegree': 
            console.log(action.payload)
            window.localStorage.setItem('degree', JSON.stringify(action.payload));
            return (state = action.payload); 
        default: 
            return state;    
    }
}
export default degreeReducer; 