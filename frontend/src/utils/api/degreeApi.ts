/* eslint-disable */
import axios from 'axios';
import { getToken } from './userApi';

export const resetDegree = async () => {
  const token = await getToken();
  try {
    await axios.post('/user/reset', null, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resetting degree at resetDegree: ' + err);
  }
};

export const handleDegreeChange = async ({ programCode }: { programCode: string }) => {
  const token = await getToken();
  resetDegree();
  try {
    await axios.put('user/setProgram', null, {
      params: { programCode: programCode.substring(0, 4), token }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error settingProgram at handleDegreeChange: ' + err);
  }
};

export const addSpecialisation = async (specialisation: string) => {
  const token = await getToken();
  try {
    await axios.put('/user/addSpecialisation', null, { params: { specialisation, token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error settingProgram at handleDegreeChange: ' + err);
  }
};

export const removeSpecialisation = async (specialisation: string) => {
  const token = await getToken();
  try {
    await axios.put('user/removeSpecialisation', null, { params: { specialisation, token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error settingProgram at handleDegreeChange: ' + err);
  }
};
