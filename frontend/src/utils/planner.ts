import axios from 'axios';
import { CourseMark } from 'types/api';
import { UserResponse } from 'types/userResponse';

export const updateCourseMark = async (courseMark: CourseMark, token: string) => {
  try {
    await axios.put('/user/updateCourseMark', courseMark, { params: { token } });
  } catch (e) {
    /* eslint-disable no-console */
    console.log(e);
  }
};

// mmm not sure of the fuckyness of catching / where it should be handled
export const getUser = async (token: string) => {
  return axios
    .get<UserResponse>(`/user/${token}`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
};
