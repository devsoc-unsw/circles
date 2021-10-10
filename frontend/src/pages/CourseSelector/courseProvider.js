import { setCourse } from "../../actions/updateCourses";
import axios from 'axios';

export const getCourseById = (id) => {
    return (dispatch) => {
        axios({
            method: 'get',
            url: `http://localhost:8000/api/getCourse/${id}`
        })
        .then(({ data }) => {
            // REVIEW COMMENT: You should use .filter here because .map expects a return value.
            // Object.keys(data).filter(course => {
            //     if (course === id) {
            //         dispatch(setCourse(data[course]));
            //     }
            // })
            dispatch(setCourse(data.course));
        })
        .catch(console.log);
    }
}