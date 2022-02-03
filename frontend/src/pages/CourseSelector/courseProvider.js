import { setCourse } from "../../actions/coursesActions";
import axios from "axios";

export const getCourseById = (id) => {
  return (dispatch) => {
    axios({
      method: "get",
      url: `http://localhost:8000/courses/getCourse/${id}`,
    })
      .then(({ data }) => {
        dispatch(setCourse(data));
      })
      .catch((err) => console.log(err));
  };
};
