import axios from 'axios';
import { Programs } from 'types/api';
import { DegreeWizardPayload } from 'types/degreeWizard';

export const resetDegree = async (token: string) => {
  try {
    await axios.post('/user/reset', null, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resetting degree at resetDegree: ', err);
  }
};

export const setupDegreeWizard = async (token: string, wizard: DegreeWizardPayload) => {
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
