import { setCourse } from "../../actions/updateCourses";
import axios from 'axios';

export const getCourseById = (id) => {
    return (dispatch) => {
        axios({
            method: 'get',
            url: `http://localhost:8000/api/getCourse/${id}`
        })
        .then(({ data }) => {
            dispatch(setCourse(data.course));
        })
        .catch(console.log("Server is broken! TODO: Show error"));
    }
}