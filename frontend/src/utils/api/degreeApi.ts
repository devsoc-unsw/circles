import axios from 'axios';
import { Programs } from 'types/api';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { getToken } from './userApi';

export const resetDegree = async () => {
  const token = await getToken();
  try {
    await axios.post('/user/reset', null, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resetting degree at resetDegree: ', err);
  }
};

export const setupDegreeWizard = async (wizard: DegreeWizardPayload) => {
  const token = await getToken();
  try {
    await axios.post('/user/setupDegreeWizard', wizard, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resetting degree at setupDegreeWizard: ', err);
    throw err;
  }
};

export const getAllDegrees = async (): Promise<Record<string, string>> => {
  const res = await axios.get<Programs>('/programs/getPrograms');
  return res.data.programs;
};
