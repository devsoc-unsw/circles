/* eslint-disable */
import axios from "axios";
import { getToken } from "./userApi";

export const resetDegree = async () => {
  const token = getToken();
  try {
    await axios.post('user/reset', true, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resetting degree at handleDegreeChange: ' + err);
  }
};

export const handleDegreeChange = async ({ key }: { key: string }) => {
  const token = getToken();
  const data = { programCode: key.substring(0, 4) };
  resetDegree();
  try {
    await axios.post('user/setProgram', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error settingProgram at handleDegreeChange: ' + err);
  }
};