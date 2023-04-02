/* eslint-disable */
import axios from "axios";
import { getToken } from "./userApi";

export const handleAddToUnplanned = async (courseId: String) => {
  const token = getToken();
  try {
    await axios.post('planner/addToUnplanned', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleAddToUnplanned: ', err);
  }
};
