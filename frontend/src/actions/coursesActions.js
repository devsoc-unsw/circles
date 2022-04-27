export const appendCourse = (payload) => ({
  type: "APPEND",
  payload,
});

export const deleteCourse = (payload) => ({
  type: "DELETE",
  payload,
});

export const setCourses = (payload) => ({
  type: "SET_COURSES",
  payload,
});

export const setCourse = (payload) => ({
  type: "SET_COURSE",
  payload,
});
