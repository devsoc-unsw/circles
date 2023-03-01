/* eslint-disable */
import { useSelector } from "react-redux";
import axios from 'axios';
import { CourseMark } from 'types/api';
import { RootState } from 'config/store';

export const updateCourseMark = async (courseMark: CourseMark) => {
  const { token } = useSelector((state: RootState) => state.settings);
  const res = await axios.put('/user/updateCourseMark', { token, courseMark });
  if (res.status != 200) {
    console.error(res.data)
  }
};
