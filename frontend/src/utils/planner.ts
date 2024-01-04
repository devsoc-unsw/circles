import axios from 'axios';
import { CourseMark } from 'types/api';
import { UserResponse } from 'types/userResponse';
import { getToken } from './api/userApi';

export const updateCourseMark = async (courseMark: CourseMark) => {
  const token = await getToken();
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
