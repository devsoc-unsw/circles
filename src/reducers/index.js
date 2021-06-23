import updateCoursesReducer from "./updateCourses"; 
import userReducer from "./userReducer";
import { combineReducers } from 'redux';
const allReducers = combineReducers({ 
    user: userReducer,
    updateCourses: updateCoursesReducer 
});

export default allReducers; 