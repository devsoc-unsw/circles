import updateCoursesReducer from "./updateCourses"; 
import degreeReducer from "./degree";
import degreetypeReducer from "./degreetype";
import { combineReducers } from 'redux';
const allReducers = combineReducers({ 
    degree: degreeReducer,
    updateCourses: updateCoursesReducer,
    degreetypeSelect: degreetypeReducer
});

export default allReducers; 