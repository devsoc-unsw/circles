import { setCourse } from "../../actions/updateCourses";
import axios from "axios";

export const getCourseById = (id) => {
  return (dispatch) => {
    axios({
      method: "get",
      url: `http://localhost:8000/courses/getCourses/${id}`,
    })
      .then(({ data }) => {
        dispatch(setCourse(data));
      })
      .catch((err) => console.log(err));
  };
};
