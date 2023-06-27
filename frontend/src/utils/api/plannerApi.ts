import axios from 'axios';
import { getToken } from './userApi';

export const handleAddToUnplanned = async (courseId: string) => {
  const token = await getToken();
  try {
    await axios.post('planner/addToUnplanned', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleAddToUnplanned: ', err);
  }
};

export const handleRemoveCourse = async (courseId: string) => {
  const token = await getToken();
  try {
    await axios.post('planner/removeCourse', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleRemoveCourse: ', err);
  }
};
