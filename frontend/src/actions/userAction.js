import axios from "axios";

export const updateDegree = (degree) => {
  return {
    type: "UPDATE_DEGREE",
    payload: degree,
  };
};

export const resetDegree = () => {
  return {
    type: "RESET_DEGREE",
  };
};

export const getDegree = () => {
  return (dispatch) => {
    // dispatch(updateDegree(data));
  };
};

export const setUnplannedCourses = (payload) => {
  return {
    type: "SET_UNPLANNED",
    payload,
  };
};

export const getUnplannedCourses = () => {
  return (dispatch) => {
    axios({
      method: "get",
      url: "http://localhost:3000/unplanned.json",
    })
      .then(({ data }) => {
        dispatch(setUnplannedCourses(data.unplanned));
      })
      .catch(console.log);
  };
};

export const addUnplannedCourse = (id) => {
  return (dispatch, getState) => {
    axios({
      method: "post",
      url: "http://localhost:3000/unplanned.json",
      data: {
        id,
      },
    })
      .then((_) => {
        dispatch(getUnplannedCourses());
      })
      .catch(console.log);
  };
};

export const updateDegreeLength = (payload) => {
  return {
    type: "UPDATE_LENGTH",
    payload: payload,
  };
};
