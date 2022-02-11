export const appendCourse = (payload) => {
  return {
    type: "APPEND",
    payload: payload,
  };
};

export const deleteCourse = (payload) => {
  return {
    type: "DELETE",
    payload: payload,
  };
};

export const setCourses = (payload) => {
  return {
    type: "SET_COURSES",
    payload: payload,
  };
};

export const setCourse = (payload) => {
  return {
    type: "SET_COURSE",
    payload: payload,
  };
};
