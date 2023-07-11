/* eslint-disable */
import axios from 'axios';
import { getToken } from './userApi';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { UserResponse } from 'types/userResponse';

export const resetDegree = async () => {
  const token = await getToken();
  try {
    let res = await axios.post('/user/reset', null, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resetting degree at resetDegree: ' + err);
  }
};

export const setupDegreeWizard = async (wizard: DegreeWizardPayload) => {
  const token = await getToken();
  try {
    console.log('wizard', wizard);
    const res = await axios.post('/user/setupDegreeWizard', wizard, { params: { token } });
    console.log('res', res);
    console.log('res.data', res.data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resetting degree at setupDegreeWizard: ' + err);
    console.error(err);
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
