import axios from 'axios';

export const appendCourse = (payload) => { 
    return { 
        type: 'APPEND', 
        payload: payload
    }
}

export const deleteCourse = (payload) => { 
    return { 
        type: 'DELETE', 
        payload: payload, 
    }
}

export const setCourses = (payload) => {
    return {
        type: 'SET_COURSES',
        payload: payload
    }
}

export const setCourse = (payload) => {
    return {
        type: 'SET_COURSE',
        payload: payload
    }
}

export const getAllCourses = () => {
    return (dispatch) => {
        axios({
            method: 'get',
            url: 'http://localhost:3000/courses.json'
        })
        .then(({ data }) => {
            dispatch(setCourses(data));
        })
        .catch(console.log);
    }
}

export const getCourseById = (id) => {
    return (dispatch) => {
        axios({
            method: 'get',
            url: 'http://localhost:3000/courses.json'
        })
        .then(({ data }) => {
            // REVIEW COMMENT: You should use .filter here because .map expects a return value.
            Object.keys(data).map(course => {
                if (course === id) {
                    dispatch(setCourse(data[course]));
                }
                return;
            })
        })
        .catch(console.log);
    }
}