import updateCoursesReducer from "./updateCourses"; 
import updateDegreeReducer from "./updateDegree";
import { combineReducers } from 'redux';
const allReducers = combineReducers({ 
    updateDegree: updateDegreeReducer,
    updateCourses: updateCoursesReducer 
});

export default allReducers; 