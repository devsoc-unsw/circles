/* eslint-disable */
import axios from 'axios';
import { CourseMark } from 'types/api';

export const updateCourseMark = async (courseMark: CourseMark, token: string) => {
  try {
    const res = await axios.put('/user/updateCourseMark', courseMark, { params: { token } });
  }
  catch (e) {
    console.log(e)
  }
};

export const getUser = async (token: string) => {
  return axios.get(`/user/${token}`).then(res => res.data).catch(err => console.log(err));
}
