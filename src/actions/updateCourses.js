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
            url: 'courses.json'
        })
        .then(({ data }) => {
            dispatch(setCourses(data));
        })
        .catch(console.log);
    }
}

export const getCourseById = (id) => {
    console.log('HERE I AMMMM', id)
    return (dispatch) => {
        axios({
            method: 'get',
            url: 'courses.json'
        })
        .then(({ data }) => {
            console.log('GOT DATA', data)
            Object.keys(data).map(course => {
            
                if (course === id) {
                    console.log('YOOO GOT IT')
                    dispatch(setCourse(data[course]));
                }
            })
        })
        .catch(console.log);
    }
}