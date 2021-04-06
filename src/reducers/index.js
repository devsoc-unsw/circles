import updateCoursesReducer from "./updateCourses"; 
import degreeReducer from "./degreeReducer";
import { combineReducers } from 'redux';
const allReducers = combineReducers({ 
    degree: degreeReducer,
    updateCourses: updateCoursesReducer 
});

export default allReducers; 